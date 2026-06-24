declare module 'next' {
  export type Metadata = {
    title?: string;
    description?: string;
    keywords?: string;
    openGraph?: {
      title?: string;
      description?: string;
      type?: string;
    };
  };
}
