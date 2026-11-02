import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import Router from "./router/Router";
import { antdTheme } from "./theme/theme";
import "./App.css";
import "./styles/shop.css";

function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={viVN}>
      <div className="App">
        <Router />
      </div>
    </ConfigProvider>
  );
}

export default App;
