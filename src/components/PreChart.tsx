import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Container, Form, Popup, Header } from "semantic-ui-react";

import Chart from "./Chart";
import { fileTypeList } from "../util/dropdowns";
import { csvConvert, jsonConvert } from "../util/fileConvert";
import { jsonExample, csvExample } from "../util/constStrings";

const PreChart: React.FC = () => {
    const [upData, setUpData] = useState([] as any[]);

    const [fileType, setFileType] = useState(fileTypeList[0].value);
    const handleFileTypeChange = (_: any, { value }: any) => setFileType(value);

    const [csvSeparator, setCsvSeparator] = useState(",");
    const handleCsvSeparatorChange = (_: any, { value }: any) => setCsvSeparator(value);

    const [keyNameList, setKeyNameList] = useState([] as { key: string; text: string; value: string }[]);
    const [dataNameList, setDataNameList] = useState([] as { key: string; text: string; value: string }[]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            let keyNameList2: { key: string; text: string; value: string }[] = [];
            let dataNameList2: { key: string; text: string; value: string }[] = [];

            const reader = new FileReader();
            reader.readAsText(acceptedFiles[0]);
            reader.onload = () => {
                let objs;
                switch (fileType) {
                    case "csv":
                        objs = csvConvert(reader.result!.toString(), csvSeparator);
                        break;
                    case "json":
                        objs = jsonConvert(reader.result!.toString());
                        break;
                    // case "xml":
                    //     objs = xmlConvert(reader.result!.toString());
                    //     break;
                    // case "excel":
                    //     objs = excelConvert(reader.result!.toString());
                    //     break;
                    default:
                        return;
                }

                Object.entries(objs[0]).forEach((field: [string, any]) => {
                    keyNameList2.push({ key: field[0], text: field[0], value: field[0] });
                });
                dataNameList2.push({ key: "MyCount", text: "Count", value: "MyCount" });

                let isNumeric: boolean[] = new Array(keyNameList2.length).fill(true);

                objs.forEach((o: any) => {
                    Object.entries(o).forEach((field: [string, any], index: number) => {
                        if (!Number(field[1])) {
                            isNumeric[index] = false;
                        }
                    });
                });

                Object.entries(objs[0]).forEach((field: [string, any], index: number) => {
                    if (isNumeric[index]) {
                        dataNameList2.push({ key: field[0], text: "avg. " + field[0], value: field[0] });
                    }
                });

                objs.forEach((o: any) => {
                    Object.entries(o).forEach((field: [string, any], index2: number) => {
                        if (isNumeric[index2]) {
                            o[field[0]] = Number(field[1]);
                        }
                    });
                });
                setUpData(objs);

                setKeyNameList(keyNameList2);
                setDataNameList(dataNameList2);
            };
        },
        [fileType, csvSeparator]
    );

    const { isDragActive, getRootProps, getInputProps, isDragReject } = useDropzone({
        onDrop,
        minSize: 0,
        maxSize: 20971520
    });

    return (
        <>
            <br />
            <Header as="h2">0. What is this?</Header>
            <p>
                A tool that can process JSON and CSV (exportable from spreadsheets or excel) data files. It identifies numerical attributes and groups
                the given data by the selected column. The sizes of these groups or different averages related to it can be displayed on the charts.
            </p>

            <br />
            <Header as="h2">1. Start by selecting a file type</Header>
            <Form>
                <Form.Group widths={5}>
                    <Form.Field>
                        <b>File type</b>
                        <Form.Dropdown selection placeholder="File type" value={fileType} onChange={handleFileTypeChange} options={fileTypeList} />
                    </Form.Field>
                    {fileType === "csv" && (
                        <Form.Field>
                            <b>Separator</b>
                            <Form.Input value={csvSeparator} onChange={handleCsvSeparatorChange} />
                        </Form.Field>
                    )}
                </Form.Group>
            </Form>
            {fileType === "csv" ? (
                <span>
                    The first row must contain the names of the columns, like{" "}
                    <Popup content={<code>{csvExample}</code>} trigger={<span style={{ color: "blue" }}>this</span>} />.
                </span>
            ) : (
                <span>
                    Provide a valid JSON array, like{" "}
                    <Popup content={<code>{JSON.stringify(jsonExample)}</code>} trigger={<span style={{ color: "blue" }}>this</span>} />. Can have
                    other formatting.
                </span>
            )}

            <br />
            <br />
            <Header as="h2">2. Upload your data file</Header>
            <Container textAlign="center">
                <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    {!isDragActive && "Click here or drop a file to upload!"}
                    {isDragActive && !isDragReject && "Drop it like it's hot!"}
                    {isDragReject && "File type not accepted, sorry!"}
                </div>
            </Container>

            {upData.length > 0 && keyNameList.length > 0 && dataNameList.length > 0 && (
                <Chart loading={false} showError={false} upData={upData} dataNameList={dataNameList} keyNameList={keyNameList} />
            )}
        </>
    );
};

export default PreChart;
