interface SwaggerConfigAPI {
  name: string;
  description: string;
  version: string;
}

interface SwaggerConfigDocs {
  path: string;
}

export interface SwaggerConfig {
  api: SwaggerConfigAPI;
  docs: SwaggerConfigDocs;
}
