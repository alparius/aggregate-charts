import React from "react";
import { Container, Segment, Grid, Header } from "semantic-ui-react";

import PreChart from "./components/PreChart";

function App() {
    return (
        <div>
            <div id="not-a-footer">
                <Segment inverted vertical style={{ padding: "1.5em 0em" }}>
                    <Container>
                        <Grid divided inverted stackable>
                            <Grid.Row>
                                <Grid.Column width={16}>
                                    <Header as="h1" inverted style={{ fontSize: "4em" }}>
                                        Aggregate-charts
                                    </Header>
                                    <p style={{ fontSize: "1.5em", textAlign: "right" }}>
                                        a.k.a. Group and Visualize your data to bring the maximum out of it
                                    </p>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                </Segment>

                <Container>
                    <PreChart />
                </Container>
            </div>
            <div id="footer">
                <Segment inverted vertical style={{ padding: "1.5em 0em" }}>
                    <Container>
                        <Grid divided inverted stackable>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <Header as="h4" inverted>
                                        Contact
                                    </Header>
                                    <p>
                                        Write me your feedback and suggestions to <a href="mailto:csekealpar12@gmail.com">csekealpar12@gmail.com</a>.
                                    </p>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <Header as="h4" inverted>
                                        Support
                                    </Header>
                                    <p>
                                        <a href="https://www.buymeacoffee.com/alparius">Buy Me A Coffee</a> if you like this tool.
                                        <br />
                                        Or you can send a few bucks directly through <a href="https://paypal.me/alparius?locale.x=en_US">PayPal</a>.
                                        {/* <link href="https://fonts.googleapis.com/css?family=Arial" rel="stylesheet" />
                                        <a className="bmc-button" target="_blank" href="https://www.buymeacoffee.com/alparius">
                                            <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a coffee" />
                                            <span style={{ marginLeft: "5px", fontSize: "19px !important" }}>Buy me a coffee</span>
                                        </a> */}
                                    </p>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Container>
                </Segment>
            </div>
        </div>
    );
}

export default App;
