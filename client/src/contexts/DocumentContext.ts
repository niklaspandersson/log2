import React from "react";
import {IDocument} from "../hooks/useDocument";

const DocumentContext = React.createContext<IDocument>(null);
export default DocumentContext;