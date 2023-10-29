import React, { useEffect, useState } from "react";
import { POPULAR_VIDEOS_API } from "../../config/constants";
import useGetVideosList from "../../utils/useGetVideosList";
import ErrorPage from "../../pages/ErrorPage";
import ShowSearchResults from "../ShowSearchResults";
import { Link } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { getFullDetails } from "../../helper";
import { channelDetails, videos } from "../../utils/mock";
import { useSearchParams } from "react-router-dom";
import { YOUTUBE_VIDEO_API,YOUTUBE_VIDEO_BY_ID } from "../../config/constants";

const constApiStatus = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const SuggestionVideos = ({ categoryId }) => {
  const [apiStaus, setApiStatus] = useState({
    status: constApiStatus.initial,
    data: {},
  });


  //>>>>>>>>>>>>>>>>>>//
  const [videoData, setVideoData] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  let [searchParams] = useSearchParams();
  const videoId = searchParams.get('v')
  const getSpecificVideoData = async () => {
    try {
      const data = await fetch(YOUTUBE_VIDEO_BY_ID + videoId);
    const response = await data.json();
    setVideoData(response?.items?.[0]);
    } catch (error) {
      console.log(error.message)
    }
  };

  const getRelatedVideos = async () => {
    try {
      const data = await fetch(YOUTUBE_VIDEO_API);
    const response = await data.json();
    setRelatedVideos(response?.items);
    } catch (error) {
      console.log(error.message)
    }
  };

  
  useEffect(() => {
     getSpecificVideoData()
    getRelatedVideos();
   
  
  }, [videoId]);
  useEffect(() => {
    setApiStatus((prev) => ({
      ...prev,
      status: constApiStatus.inProgress,
    }));
  }, []);
  const videosList = useGetVideosList(
    (POPULAR_VIDEOS_API + "&videoCategoryId=" + categoryId).replace(
      "maxResults=50",
      "maxResults=20"
    )
  );
  useEffect(() => {
    if (videosList?.videos?.length > 0) {
      setApiStatus((prev) => ({
        ...prev,
        status: constApiStatus.success,
        data: videosList,
      }));
    } else if (videosList.error === 404) {
      setApiStatus((prev) => ({
        ...prev,
        status: constApiStatus.success,
        data: { videos, channelDetails },
      }));
    } else if (videosList.error) {
      setApiStatus((prev) => ({
        ...prev,
        status: constApiStatus.failure,
      }));
    } else if (videosList === undefined) {
      setApiStatus((prev) => ({
        ...prev,
        status: constApiStatus.inProgress,
      }));
    }
  }, [videosList?.videos, videosList.error]);
  const SuccessView = () => {
    const videos = apiStaus?.data?.videos;
    const channel = apiStaus?.data?.channelDetails;
    const fullDetails = getFullDetails(videos, channel);
    return (
      <div>
        mai
      </div>
  
    );
  };

  const FailureView = () => {
    return <ErrorPage />;
  };
  const RenderResults = () => {
    switch (apiStaus.status) {
      case constApiStatus.inProgress:
        return (
          <div className="w-full h-full flex items-center justify-center m-auto">
            <RingLoader />
          </div>
        );
      case constApiStatus.success:
        return <SuccessView />;
      case constApiStatus.failure:
        return <FailureView />;
      default:
        return null;
    }
  };
  return (
    <div className="h-[50vh]">
       {relatedVideos.map((videoData) => (
           <Link key={videoData?.id} to={'/watch?v=' + videoData?.id}>
  <div  className="flex max-w-full mt-3 overflow-scroll ">
    <img
      className="rounded-lg h-[110px]"
      src={videoData?.snippet?.thumbnails?.medium?.url}
      alt=""
    />
    <div className="ml-3">
      <p className="font-semibold">{videoData?.snippet?.title}</p>
      <p className="mt-1 text-sm font-semibold">{videoData?.snippet?.channelTitle}</p>
     
    </div>
  </div>
  </Link>
))}

    </div>
  );
};

export default SuggestionVideos;
