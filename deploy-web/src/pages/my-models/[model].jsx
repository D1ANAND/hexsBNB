import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  fetchEngagementCount,
  fetchForkCount,
  fetchMyModelsPage,
  getAllReviews,
  getTotalModelOwners,
  updateEngagementCount
} from "../../utils/evmContractInteraction";
import { RoyaltyRateModal } from "./RoyaltyRateModal";

export default function MarketPlacePage() {

  const [modelInfo, setModelInfo] = useState({
    modelId: "",
    modelOwners: "",
    hash: "",
    forksCount: "",
    engagementsCount: "",
    modelPrice: "",
    reviews: []
  });
  const [loading, setLoading] = useState(false);

  const pathName = usePathname();
  const modelId = pathName?.split("/")[2];

  useEffect(() => {
    fetchModelInfo();
    updateEngagementCountCall();
  }, []);

  async function fetchModelInfo() {
    setLoading(true);
    const data = await fetchMyModelsPage();
    const model = data.find(obj => obj.modelId == modelId);
    const modelOwners = await getTotalModelOwners(modelId);
    const reviews = await getAllReviews(modelId);
    const engagementsCount = await fetchEngagementCount(modelId);
    const forkCount = await fetchForkCount(modelId);
    setModelInfo({
      ...modelInfo,
      modelId: model.modelId,
      modelOwners: modelOwners,
      hash: model.encryptedSDLURI,
      forkCount: forkCount,
      engagementsCount: engagementsCount,
      modelPrice: model.lastSoldPrice,
      reviews: reviews
    });
    setLoading(false);
  }

  async function updateEngagementCountCall() {
    await updateEngagementCount(modelId);
  }

  const cardContainerStyle = {
    display: "flex",
    flexDirection: "column"
    // flexWrap: "wrap",
    // justifyContent: "space-between"
  };

  const cardStyle = {
    display: "flex",
    width: "45%",
    backgroundColor: "#2A2B2B",
    fontSize: "0.8rem",
    padding: "20px",
    margin: "20px",
    borderRadius: "3px"
  };

  const buttonsContainer = {
    display: "flex",
    gap: "10px"
  };

  const CardButton = {
    backgroundColor: "#DF5737",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  };

  function ReviewCards(props) {
    return <div style={cardStyle}>{props.review}</div>;
  }

  const [isSellModalOpen, setSellModalOpen] = useState(false);

  return (
    <Layout>
      <NextSeo title={`Model Info`} />

      <PageContainer>
        <Title value="Model Info" />
        <div style={cardContainerStyle}>
          <div>
            <p>Total Owners: {modelInfo.modelOwners}</p>
            <p>Hash: {modelInfo.hash}</p>
            <p>Fork Count: {modelInfo.forksCount}</p>
            <p>Engagements Score: {modelInfo.engagementsCount}</p>
          </div>
          <div>
          <button onClick={() => setSellModalOpen(true)} style={CardButton}>
              Update Royalties
            </button>
            <RoyaltyRateModal modelId={modelId} isOpen={isSellModalOpen} onClose={() => setSellModalOpen(false)} />
          </div>

          <p>Reviews: </p>
          {modelInfo.reviews > 0 ? (
            modelInfo.reviews.map((review, i) => {
              return <ReviewCards key={i} review={review} />;
            })
          ) : (
            <p>No Reviews yet</p>
          )}
        </div>
      </PageContainer>
    </Layout>
  );
}

