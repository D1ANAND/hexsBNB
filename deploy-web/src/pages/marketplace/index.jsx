import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchMyModelsPage, buyModelCall } from "../../utils/evmContractInteraction";
import { currencyTicker } from "../../utils/constants/constants";

export default function MarketPlacePage() {
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getModels();
  }, []);

  async function getModels() {
    setLoading(true);
    const data = await fetchMyModelsPage();
    console.log("models page: ", data);
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
  }

  const CardButton = {
    backgroundColor: "#DF5737",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  };

  function Cards(props) {
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
          {/* <p>Model ID: {props.modelId}</p> */}
          {/* <p>Reviews URI: {props.reviewsURI}</p> */}
          {/* <p>Encrypted SDL URI: {props.encryptedSDLURI}</p> */}
          {/* <p>Visibility: {props.visibility}</p> */}
          {/* <p>Forked: {props.isForked}</p> */}
          {/* <p>Base Model: {props.baseModel}</p> */}
          <p>Price: {props.lastSoldPrice}{` `}{currencyTicker}</p>
          {/* <p>On Sale: {props.onSale}</p> */}
          {props.baseModel == 0 ? (
            <div>
              <p>Base Model</p>
            </div>
          ) : (
            <div>Forked from model {props.forkedFrom}</div>
          )}
          <div style={buttonsContainer}>
            <button onClick={() => buyModelCall(props.modelId)} style={CardButton}>
              Buy
            </button>
            
          </div>
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
      <NextSeo title={`Marketplace`} />

      <PageContainer>
        <Title value="Marketplace Models" />
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

