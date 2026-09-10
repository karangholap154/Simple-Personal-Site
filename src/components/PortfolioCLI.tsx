import { lazy } from "react";

export const PortfolioCLI = lazy(() => import("./terminal/PortfolioCLI"));
export default PortfolioCLI;
export { FixedTerminalButton } from "./terminal/FixedTerminalButton";