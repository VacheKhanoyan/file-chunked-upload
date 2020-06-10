import React, { useState } from "react";

import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Upload, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

const { Dragger } = Upload;

// export const filesQuery = gql`
//   {
//     upload
//   }
// `;

const uploadFileMutation = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file)
  }
`;

const App = () => {
  const [filesList, setFilesList] = useState([]);
  const [uploadFile] = useMutation(uploadFileMutation);

  function sliceFile(file, chunksMaxSize) {
    const chunksAmount = Math.ceil(file.size / chunksMaxSize);
    let byteIndex = 0;
    let step = 1;
    let chunkedSumUpSize = 0;
    const type = file.type.split("/")[1];

    function chunkBuilder() {
      console.log("step", step);
      console.log("chunkAmount", chunksAmount);
      let byteEnd = Math.ceil((file.size / chunksAmount) * step);
      let chunkProgress =
        step === 1
          ? "start"
          : step > 1 && step < chunksAmount
          ? "inProgress"
          : "end";

      const chunkObj = {
        chunk: file.slice(byteIndex, byteEnd),
        filename: file.name,
        chunkId: file.uid,
        chunkProgress,
        type,
      };
      chunkedSumUpSize += chunkObj.chunk.size;
      chunkProgress === "end" && (chunkObj.sumUp = chunkedSumUpSize);
      // chunks.push(chunkObj);

      byteIndex += byteEnd - byteIndex;
      if (step <= chunksAmount) {
        step++;
        return chunkObj;
      }
    }
    return chunkBuilder;
  }

  const onUpload = () => {
    const chukedFilesList = filesList.map((file) => sliceFile(file, 100000));
    let res = true;
    console.log("sadasd", chukedFilesList, filesList);
    chukedFilesList.forEach(async (chunckedRequest, index) => {
      let fileProgres = "start";

      while (fileProgres !== "end") {
        let file = chunckedRequest();
        fileProgres = file.chunkProgress;
        await uploadFile({ variables: { file } });
      }
    });
  };

  const props = {
    name: "file",
    multiple: true,
    // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    accpt: ".jpg",
    // onChange(info) {
    //   const { status } = info.file;

    //   if (status !== "uploading") {
    //     console.log(info.file, info.fileList);
    //   }
    //   if (status === "done") {
    //     message.success(`${info.file.name} file uploaded successfully.`);
    //     console.log(
    //       "instnace of 1111111111",
    //       info.fileList[0],
    //       info.fileList[0] instanceof Blob
    //     );
    //   } else if (status === "error") {
    //     message.error(`${info.file.name} file upload failed.`);
    //   }
    // },
    transformFile: (file) => {
      console.log("instnace of Blob", file instanceof Blob, file);
      setFilesList([...filesList, file]);
    },
  };
  return (
    <>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading
          company data or other band files
        </p>
      </Dragger>
      <Button disabled={!filesList.length} onClick={onUpload}>
        Save
      </Button>
    </>
  );
};

export default App;
