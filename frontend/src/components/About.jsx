import { useState, useEffect } from "react";
import { axiosInstance } from "../api/axios";

const About = () => {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    // let isMount = true;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await axiosInstance.get("/about");
        // console.log(response.data.message.getAbout);
        // isMount &&
         setAboutData(response.data.message.getAbout);
      } catch (error) {
        // if (axiosInstance.isCancel(error)) {
        //   console.log("Request Canceled ::", error.message);
        //   return;
        // }
        // if (error.response) {
        //   console.log(error.response.data);
        //   console.log(error.response.status);
        //   console.log(error.response.headers);
        // } else if (error.request) {
        //   console.log(error.request);
        // } else {
        //   console.log("Error", error.message);
        // }
        // console.log(error.config);
      }
    })();

    return () => {
      // isMount = false;
      controller.abort();
    };
  }, []);

  return (
    <div>
      <p>name: {aboutData?.name}</p>
      <p>Age: {aboutData?.age}</p>
      <p>Location: {aboutData?.location}</p>
    </div>
  );
};

export default About;
