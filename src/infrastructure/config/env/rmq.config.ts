import { RMQConfig } from '../types/rmq.interface';

export const rmqConfigToken = Symbol('rmq');

export const rmqConfig = (): { rmq: RMQConfig } => {
  const { RMQ_CONTACT_URL, RMQ_CONTACT_QUEUE } = process.env;

  return {
    rmq: {
      url: RMQ_CONTACT_URL,
      queue: RMQ_CONTACT_QUEUE,
    },
  };
};
