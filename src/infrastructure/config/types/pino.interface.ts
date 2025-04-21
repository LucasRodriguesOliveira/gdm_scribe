interface PinoConfigTransport {
  target: string | null;
}

export interface PinoConfig {
  level: string;
  transport?: PinoConfigTransport;
}
