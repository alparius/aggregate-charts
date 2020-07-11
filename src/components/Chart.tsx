import React, { useState } from "react";
import {
    Bar,
    BarChart,
    BarSeries,
    LinearXAxis,
    LinearXAxisTickLabel,
    LinearXAxisTickSeries,
    LinearYAxis,
    LinearYAxisTickSeries,
    LineChart,
    PieArcSeries,
    PieChart,
    PieArcLabel,
    LinearYAxisTickLabel
} from "reaviz";
import { Button, Form, Header, Modal, Segment, List } from "semantic-ui-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import IChartData from "../model/ChartData";
import MyPlaceholder from "./MyPlaceholder";
import { chartNameList, axisNameList, colorSchemeList } from "../util/dropdowns";

interface IChartProps {
    upData: object[];
    loading: boolean;
    showError: boolean;
    keyNameList: { key: string; text: string; value: string }[];
    dataNameList: { key: string; text: string; value: string }[];
}

const Chart: React.FC<IChartProps> = (props: IChartProps) => {
    const { upData, loading, showError, keyNameList, dataNameList } = props;

    const [chartName, setChartName] = useState(chartNameList[0].value);
    const [xAxis, setXAxis] = useState(keyNameList[0].value);
    const [yAxis, setYAxis] = useState(dataNameList[0].value);
    const [sortedAxis, setSortedAxis] = useState(axisNameList[0].value);
    const [minGroupSize, setMinGroupSize] = useState(1);
    const [showEtc, setShowEtc] = useState(true);
    const [colorScheme, setColorScheme] = useState(colorSchemeList[0].value);
    const [fontSize, setFontSize] = useState(18);
    const [chartExtra, setChartExtra] = useState(false);

    const handleChartNameChange = (_: any, { value }: any) => setChartName(value);
    const handleXAxisChange = (_: any, { value }: any) => setXAxis(value);
    const handleYAxisChange = (_: any, { value }: any) => setYAxis(value);
    const handleSortedAxisChange = (_: any, { value }: any) => setSortedAxis(value);
    const handleMinGroupSizeChange = (_: any, { value }: any) => setMinGroupSize(value);
    const handleShowEtcChange = (_: any) => setShowEtc((prev: boolean) => !prev);
    const handleFontSizeChange = (_: any, { value }: any) => setFontSize(value);
    const handleColorShemeChange = (_: any, { value }: any) => setColorScheme(value);
    const handleChartExtraChange = (_: any) => setChartExtra((prev: boolean) => !prev);

    const [infoOpen, setInfoOpen] = useState(false);

    if (showError) {
        return <Segment>Error.</Segment>;
    } else if (loading) {
        return <MyPlaceholder />;
    } else if (!upData || upData.length === 0) {
        return <Segment>No data.</Segment>;
    } else {
        let chartData: IChartData[] = [];
        let chartDatum: IChartData;
        let usedDataSize: number = 0;

        upData.forEach((p: any) => {
            if (p[xAxis] !== undefined && p[xAxis] !== 0 && p[xAxis] !== "") {
                usedDataSize += 1;
                const match = chartData.filter((item: IChartData) => item.key === p[xAxis]);
                // new entry or incrementing an existing one
                if (match.length === 0) {
                    chartDatum = { key: p[xAxis], data: p[yAxis], counter: 1 };
                    chartData.push(chartDatum);
                } else {
                    match[0].data += p[yAxis];
                    match[0].counter += 1;
                }
            }
        });

        if (chartName !== "line") {
            // aggregating small categories on pie/bar
            const temp = chartData.filter((item: IChartData) => item.counter < minGroupSize);
            chartDatum = {
                key: "Aggregated groups",
                data: temp.reduce((prev: number, next: IChartData) => prev + (next.data || 0), 0),
                counter: temp.reduce((prev: number, next: IChartData) => prev + (next.counter || 0), 0)
            };
            // to include or not the aggregated small categories
            if (showEtc) {
                chartData.push(chartDatum);
            } else {
                usedDataSize -= chartDatum.counter;
            }
        }

        if (yAxis !== "MyCount") {
            // if not population size statistic, divide and round the aggregate with the counter
            chartData.forEach((item: IChartData) => (item.data = Math.round((item.data / item.counter) * 100) / 100));
        } else {
            // if population size statistic, then the data is the counter
            chartData.forEach((item: IChartData) => (item.data = item.counter));
        }

        //TODO line is year
        // filter by the aggregate axis by group size on pie/bar
        if (chartName !== "line") {
            if (yAxis === "MyCount") {
                chartData = chartData.filter((item: IChartData) => item.data >= minGroupSize);
            } else {
                chartData = chartData.filter((item: IChartData) => item.counter >= minGroupSize);
            }
        }

        //TODO boolean support
        // let colorScheme = customColorSchemes.Meine;
        // // boolean main axis
        // if (xAxis.startsWith("is")) {
        //     colorScheme = customColorSchemes.MeineBoolean;
        //     chartData.forEach((item: IChartData) => (item.key = item.key ? "Yes" : "No"));
        // }

        // sort by the selected sorting axis
        if (chartName === "line") {
            chartData = chartData.sort((a: IChartData, b: IChartData) => a.key - b.key);
        } else if (sortedAxis === "x") {
            chartData = chartData.sort((a: IChartData, b: IChartData) => (b.key.toString() as string).localeCompare(a.key));
        } else {
            chartData = chartData.sort((a: IChartData, b: IChartData) => a.data - b.data);
        }

        if (chartName === "pie") {
            chartData.forEach((item: IChartData) => (item.key = item.key + ": " + item.data));
        }

        const saveAs = (uri: string, filename: string) => {
            var link = document.createElement("a");

            if (typeof link.download === "string") {
                link.href = uri;
                link.download = filename;

                //Firefox requires the link to be in the body
                document.body.appendChild(link);

                //simulate click
                link.click();

                //remove the link when done
                document.body.removeChild(link);
            } else {
                window.open(uri);
            }
        };

        const printDocument = (image: boolean = false) => {
            window.scrollTo(0, 0);
            let input = document.getElementById("divToPrint");

            html2canvas(input!, { height: 500 }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");

                const now = new Date();
                const fileName = `AggregateCharts_${now.getFullYear()}-${now.getMonth()}-${now.getDay()}_${now.getHours()}-${now.getMinutes()}`;
                if (image) {
                    saveAs(canvas.toDataURL(), `${fileName}.png`);
                } else {
                    const pdf = new jsPDF();
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, "JPEG", 5, 5, pdfWidth - 5, pdfHeight - 5);
                    pdf.save(`${fileName}.pdf`);
                }
            });
        };

        return (
            <>
                <Modal open={infoOpen} onClose={() => setInfoOpen(false)}>
                    <Modal.Header>About the chart designer</Modal.Header>
                    <Modal.Content>
                        <List bulleted>
                            <List.Item>
                                Under <b>Common property</b> you can select the data field which will be the common (grouping) factor in the diagram,
                                while the <b>Value axis</b> option marks the aggregated attribute of these groups: either some sort of average, or
                                simply the size of the respective group (first option).
                            </List.Item>
                            <List.Item>
                                Under <b>Sort by</b> you can toggle between ordering the groups aphanumerically, by the Common Property or
                                numerically, decreasing, by the aggregated Value.
                            </List.Item>
                            <List.Item>
                                The value entered in the <b>Minimum group size</b> field will act as an upper limit to the sizes of the groups, so
                                groups aggregated by less values will be combined into a category named <i>Aggregated groups</i>, to make your chart
                                more transparent.
                            </List.Item>
                            <List.Item>
                                This <i>Aggregated</i> group sometimes can grow rather big depending on your search, and more importantly on the
                                increased
                                <i>Minimum group size</i>, this is why you can toggle between showing and hiding this Aggregated group on your chart
                                by the
                                <b>Show aggregated small groups</b> dial.
                            </List.Item>
                        </List>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="violet" onClick={() => setInfoOpen(false)} inverted content="Back" />
                    </Modal.Actions>
                </Modal>
                <br />
                <br />
                <Header as="h2">
                    3. Configure &amp; customize it (
                    <a href="#" onClick={() => setInfoOpen(true)}>
                        help
                    </a>
                    )
                </Header>

                <Form>
                    <Form.Group widths={3}>
                        <Form.Field>
                            <b>Chart type</b>
                            <Form.Dropdown
                                selection
                                placeholder="Chart type"
                                value={chartName}
                                onChange={handleChartNameChange}
                                options={chartNameList}
                            />
                        </Form.Field>

                        <Form.Field>
                            <b>Common property</b>
                            <Form.Dropdown selection placeholder="Main axis" value={xAxis} onChange={handleXAxisChange} options={keyNameList} />
                        </Form.Field>

                        <Form.Field>
                            <b>Value axis</b>
                            <Form.Dropdown selection placeholder="Secondary axis" value={yAxis} onChange={handleYAxisChange} options={dataNameList} />
                        </Form.Field>
                    </Form.Group>

                    <Form.Group widths={3}>
                        {chartName !== "line" && (
                            <>
                                <Form.Field>
                                    <b>Sort by</b>
                                    <Form.Dropdown
                                        selection
                                        placeholder="Sorted axis"
                                        value={sortedAxis}
                                        onChange={handleSortedAxisChange}
                                        options={axisNameList}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <b>Minimum group size</b>
                                    <Form.Input type="number" value={minGroupSize} onChange={handleMinGroupSizeChange} />
                                </Form.Field>

                                <Form.Field>
                                    <b>Show aggregated small groups</b>
                                    <Form.Checkbox toggle style={{ marginTop: "0.8em" }} checked={showEtc} onChange={handleShowEtcChange} />
                                </Form.Field>
                            </>
                        )}
                    </Form.Group>

                    <br />
                    <Form.Group widths={3}>
                        <Form.Field>
                            <b>Color scheme</b>
                            <Form.Dropdown
                                selection
                                placeholder="Color scheme"
                                value={colorScheme}
                                onChange={handleColorShemeChange}
                                options={colorSchemeList}
                            />
                        </Form.Field>

                        <Form.Field>
                            <b>Label font size</b>
                            <Form.Input type="number" value={fontSize} onChange={handleFontSizeChange} />
                        </Form.Field>

                        <Form.Field>
                            {chartName === "pie" && (
                                <>
                                    <b>Explode</b>
                                    <Form.Checkbox toggle style={{ marginTop: "0.8em" }} checked={chartExtra} onChange={handleChartExtraChange} />
                                </>
                            )}
                            {chartName === "bar" && (
                                <>
                                    <b>Vertical</b>
                                    <Form.Checkbox toggle style={{ marginTop: "0.8em" }} checked={chartExtra} onChange={handleChartExtraChange} />
                                </>
                            )}
                        </Form.Field>
                    </Form.Group>
                </Form>
                {chartData.length === 0 ? (
                    <Header as="h4">
                        <b>No results were found for your search. Try another configration or widen the search criterias.</b>
                    </Header>
                ) : (
                    // ) : chartName === "line" && !xAxis.includes("Year") ? (
                    //     <Header as="h4">
                    //         <b>This chart type doesn't work with this Common property. Try another configration.</b>
                    //     </Header>
                    <>
                        <br />
                        <br />
                        <Header as="h2">4. Enjoy, and save it down</Header>

                        <Button onClick={() => printDocument()}>Save chart as PDF</Button>
                        <Button onClick={() => printDocument(true)}>Save chart as image</Button>

                        {/* <p style={{ marginTop: "2em" }}>
                            {upData.length} entities found matching your search, from this {usedDataSize} are used in this chart instance.
                        </p> */}

                        <div style={{ height: "480px", width: "100%" }} id="divToPrint">
                            {chartName === "line" ? (
                                <LineChart
                                    data={chartData}
                                    // series={
                                    //     <LineSeries
                                    //         colorScheme={colorSchemeList[Number(colorScheme)].value2}
                                    //         animated
                                    //         interpolation="smooth"
                                    //         line={<Line strokeWidth={2} />}
                                    //     />
                                    // }
                                    // xAxis={
                                    //     <LinearXAxis
                                    //         type="duration"
                                    //         domain={[chartData[0].key, chartData[chartData.length - 1].key]}
                                    //         tickSeries={
                                    //             <LinearXAxisTickSeries label={<LinearXAxisTickLabel rotation={false} fontSize={fontSize} />} />
                                    //         }
                                    //     />
                                    // }
                                    // yAxis={<LinearYAxis type="duration" />}
                                />
                            ) : chartName === "pie" ? (
                                <PieChart
                                    data={chartData}
                                    series={
                                        <PieArcSeries
                                            label={<PieArcLabel fontSize={fontSize} />}
                                            explode={chartExtra}
                                            colorScheme={colorSchemeList[Number(colorScheme)].value2}
                                        />
                                    }
                                />
                            ) : (
                                chartName === "bar" && (
                                    <BarChart
                                        data={chartData}
                                        xAxis={
                                            <LinearXAxis
                                                type={chartExtra ? "category" : "value"}
                                                tickSeries={
                                                    <LinearXAxisTickSeries tickSize={50} label={<LinearXAxisTickLabel fontSize={fontSize} />} />
                                                }
                                            />
                                        }
                                        yAxis={
                                            <LinearYAxis
                                                type={chartExtra ? "value" : "category"}
                                                tickSeries={
                                                    <LinearYAxisTickSeries tickSize={50} label={<LinearYAxisTickLabel fontSize={fontSize} />} />
                                                }
                                            />
                                        }
                                        series={
                                            <BarSeries
                                                colorScheme={colorSchemeList[Number(colorScheme)].value2}
                                                layout={chartExtra ? "vertical" : "horizontal"}
                                                bar={<Bar rounded />}
                                            />
                                        }
                                    />
                                )
                            )}
                        </div>
                    </>
                )}
            </>
        );
    }
};

export default Chart;
