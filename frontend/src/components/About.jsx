import { useState, useEffect } from "react";
import { axiosInstance } from "../api/axios";

const About = () => {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    let isMount = true;
    const controller = new AbortController()
    ;(async () => {
      const response = await axiosInstance.get("/auth/about", {
        signal: controller.signal,
      });
      isMount && setAboutData(response.data);
    })();
    return () => {
      isMount = false;
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
