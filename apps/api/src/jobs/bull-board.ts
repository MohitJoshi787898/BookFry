import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { allQueues } from './queues';

export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/v1/admin/queues');

if (allQueues.length > 0) {
  createBullBoard({
    queues: allQueues.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });
}
