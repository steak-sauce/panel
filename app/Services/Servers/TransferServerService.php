<?php

namespace Pterodactyl\Services\Servers;

use Carbon\CarbonImmutable;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Allocation;
use Pterodactyl\Models\ServerTransfer;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Services\Nodes\NodeJWTService;
use Pterodactyl\Repositories\Wings\DaemonTransferRepository;
use Pterodactyl\Exceptions\Service\Server\TransferServerException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class TransferServerService
{
    /**
     * TransferServerService constructor.
     */
    public function __construct(
        private ConnectionInterface $connection,
        private DaemonTransferRepository $daemonTransferRepository,
        private NodeJWTService $nodeJWTService
    ) {
    }

    /**
     * Transfer a server to a new node.
     *
     * @throws \Throwable
     */
    public function handle(Server $server, int $nodeId, int $allocationId, array $additionalAllocations = []): ServerTransfer
    {
        // Check if server is already transferring
        if (!is_null($server->transfer)) {
            throw new ConflictHttpException('Server is already being transferred.');
        }

        // Validate the target node exists
        $node = Node::findOrFail($nodeId);

        // Validate the target allocation exists and is available
        $allocation = Allocation::where('id', $allocationId)
            ->where('node_id', $nodeId)
            ->whereNull('server_id')
            ->firstOrFail();

        // Validate additional allocations if provided
        if (!empty($additionalAllocations)) {
            $validAllocations = Allocation::whereIn('id', $additionalAllocations)
                ->where('node_id', $nodeId)
                ->whereNull('server_id')
                ->count();
            
            if ($validAllocations !== count($additionalAllocations)) {
                throw new TransferServerException('One or more additional allocations are invalid or unavailable.');
            }
        }

        return $this->connection->transaction(function () use ($server, $node, $allocation, $additionalAllocations) {
            // Temporarily assign the primary allocation to this server
            $allocation->update(['server_id' => $server->id]);

            // Assign additional allocations
            if (!empty($additionalAllocations)) {
                Allocation::whereIn('id', $additionalAllocations)->update(['server_id' => $server->id]);
            }

            // Create the transfer record
            $transfer = ServerTransfer::create([
                'server_id' => $server->id,
                'old_node' => $server->node_id,
                'new_node' => $node->id,
                'old_allocation' => $server->allocation_id,
                'new_allocation' => $allocation->id,
                'old_additional_allocations' => $server->allocations->where('id', '!=', $server->allocation_id)->pluck('id')->toArray(),
                'new_additional_allocations' => $additionalAllocations,
            ]);

            // Generate JWT token for the target node
            $token = $this->nodeJWTService
                ->setExpiresAt(CarbonImmutable::now()->addMinutes(15))
                ->setSubject($server->uuid)
                ->setClaims([
                    'server_id' => $server->uuid,
                    'transfer' => true,
                ])
                ->handle($node, $server->uuid . $server->id);

            // Notify the source Wings to start the transfer
            $this->daemonTransferRepository
                ->setServer($server)
                ->notify($node, $token);

            return $transfer;
        });
    }
}
