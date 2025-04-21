import { GRPCConfig } from '../types/grpc.interface';

export const grpcConfigToken = Symbol('grpc');

export const grpcConfig = (): { grpc: GRPCConfig } => {
  return {
    grpc: {
      url: process.env.GRPC_FORGE_URL,
    },
  };
};
