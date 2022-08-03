import type { AppProps } from "next/app";

import "../styles/App.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <div className="App">
      <Component {...pageProps} />
    </div>
  );
}

export default App;
