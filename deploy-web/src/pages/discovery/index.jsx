import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchDiscoveryPage, forkModelCall } from "../../utils/evmContractInteraction";
import { ReviewModal } from "./ReviewModal";

export default function MarketPlacePage() {
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getModels();
  }, []);

  async function getModels() {
    setLoading(true);
    const data = await fetchDiscoveryPage();
    console.log("discovery models page: ", data);
    setAllModels(data);
    setLoading(false);
  }

  const cardContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between"
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

  function Cards(props) {
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);

    return (
      <div style={cardStyle}>
        <div>
          {props.visibility == "true" ? (
            <div>
              <p>Public Model</p>
            </div>
          ) : (
            <div>
              <p>Private Model</p>
            </div>
          )}
          <p>Creator: {props.creator}</p>
          <p>NFT Contract: {props.NFTContract}</p>
          {/* <p>Owner: {props.owner}</p> */}
          <p>Model ID: {props.modelId}</p>
          {/* <p>Reviews URI: {props.reviewsURI}</p> */}
          {/* <p>Encrypted SDL URI: {props.encryptedSDLURI}</p> */}
          {/* <p>Visibility: {props.visibility}</p> */}
          {/* <p>Forked: {props.isForked}</p> */}
          {/* <p>Base Model: {props.baseModel}</p> */}
          {/* <p>Last Sold Price: {props.lastSoldPrice}</p> */}
          {/* <p>On Sale: {props.onSale}</p> */}
          {props.baseModel == 0 ? (
            <div>
              <p>Base Model</p>
            </div>
          ) : (
            <div><p>Forked from model {props.forkedFrom}</p></div>
          )}
          <div style={buttonsContainer}>
            <button onClick={() => setReviewModalOpen(true)} style={CardButton}>
              Add Review
            </button>
            {props.visibility == "true" ? (
              <button onClick={() => forkModelCall(props.modelId)} style={CardButton}>
                Fork
              </button>
            ) : (
              <div></div>
            )}
          </div>
          <ReviewModal modelId={props.modelId} isOpen={isReviewModalOpen} onClose={() => setReviewModalOpen(false)} />
        </div>
        <div>
          {/* <Link href={`/marketplace/${props.modelId}`}>
              <a>View</a>
            </Link> */}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <NextSeo title={`Discovery`} />

      <PageContainer>
        <Title value="Discover Models" />
        <div style={cardContainerStyle}>
          {allModels.map((nft, i) => {
            return (
              <Cards
                // setActiveEvents={setActiveEvents}
                // toast={toast}
                key={i}
                creator={nft?.creator}
                owner={nft?.owner}
                modelId={nft?.modelId}
                reviewsURI={nft?.reviewsURI}
                encryptedSDLURI={nft?.encryptedSDLURI}
                visibility={nft?.visibility}
                isForked={nft?.isForked}
                baseModel={nft?.baseModel}
                forkedFrom={nft?.forkedFrom}
                NFTContract={nft?.NFTContract}
                lastSoldPrice={nft?.lastSoldPrice}
                onSale={nft?.onSale}
              />
            );
          })}
        </div>
      </PageContainer>
    </Layout>
  );
}

