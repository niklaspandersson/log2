import React from "react";

interface LoaderProps {
    children?:React.ReactNode;
}

export default function Loader(props:LoaderProps) {
    let loadingContent = <h1>Loading...</h1>
    return <>{props.children || loadingContent}</>;
}