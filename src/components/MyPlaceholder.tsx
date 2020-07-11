import React from "react";
import { Placeholder } from "semantic-ui-react";

const MyPlaceholder = () => (
    <Placeholder>
        <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
        </Placeholder.Header>
        <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
        </Placeholder.Paragraph>
    </Placeholder>
);

export default MyPlaceholder;
