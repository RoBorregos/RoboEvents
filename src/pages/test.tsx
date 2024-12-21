import Layout from "~/components/layout/Layout";
import BarViewEvents from "~/components/containers/BarViewEvents";
import { PageBody } from "~/components/general/PageElements";
import { ChangeEvent, useState } from "react";
import xlsx from 'node-xlsx';

export default function Home() {
  const [file, setFile] = useState<File>();
  
   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (file) {
      console.log(file);
      const workSheetFromFile = xlsx.parse(file);
      console.log(workSheetFromFile);

    }

    // // 👇 Uploading the file using the fetch API to the server
    // fetch('https://httpbin.org/post', {
    //   method: 'POST',
    //   body: file,
    //   // 👇 Set headers manually for single file upload
    //   headers: {
    //     'content-type': file.type,
    //     'content-length': `${file.size}`, // 👈 Headers need to be a string
    //   },
    // })
    //   .then((res) => res.json())
    //   .then((data) => console.log(data))
    //   .catch((err) => console.error(err));
  };



  return (
    <Layout>
      <PageBody>
        <div>
            <input type="file" onChange={handleFileChange} />
             <div>{file && `${file.name} - ${file.type}`}</div>
             <button onClick={handleUploadClick}>Upload</button>
        </div>
      </PageBody>
    </Layout>
  );
}
