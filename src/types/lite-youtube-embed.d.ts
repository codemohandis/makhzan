declare module 'lite-youtube-embed';

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'lite-youtube': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          videoid: string;
          playlabel?: string;
        },
        HTMLElement
      >;
    }
  }
}
