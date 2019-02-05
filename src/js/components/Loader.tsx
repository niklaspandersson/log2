import React from "react";

interface LoaderProps {
}

const Loader: React.FunctionComponent<LoaderProps> = (props) => {
    return <> { props.children || <h1>Loading...</h1>} </>
   }

export default Loader;