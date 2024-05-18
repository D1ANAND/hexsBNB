import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchMyModelsPage, downloadSDL, changeVisibilityCall, getModelEncryptedSDLURI } from "../../utils/evmContractInteraction";
import {SellModal} from "./SellModal";
import {DAOModal} from "./DAOModal";

export default function MarketPlacePage() {
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getModels();
  }, []);

  async function getModels() {
    setLoading(true);
    const data = await fetchMyModelsPage();
    console.log("inventory models page: ", data);
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

    const [isSellModalOpen, setSellModalOpen] = useState(false);
    const [isDAOModalOpen, setDAOModalOpen] = useState(false);

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
          {/* <p>Last Sold Price: {props.lastSoldPrice}</p> */}
          {/* <p>On Sale: {props.onSale}</p> */}
          <p>Dao Members: {props.daoMembers}</p>

          {props.baseModel == 0 ? (
            <div>
              <p>Base Model</p>
            </div>
          ) : (
            <div><p>Forked from model {props.forkedFrom}</p></div>
          )}
          <div style={buttonsContainer}>
            <button onClick={() => downloadSDL(props.modelId)} style={CardButton}>
              Deploy
            </button>
            <button onClick={() => changeVisibilityCall(props.modelId, props.visibility)} style={CardButton}>
              {props.visibility == "true" ? <>Private</> : <>Public</>}
            </button>
            <button onClick={() => setSellModalOpen(true)} style={CardButton}>
              Sell
            </button>
            <button onClick={() => setDAOModalOpen(true)} style={CardButton}>
              Add
            </button>
            <button onClick={() => getModelEncryptedSDLURI(props.modelId)} style={CardButton}>
              Hash
            </button>
            <SellModal modelId={props.modelId} isOpen={isSellModalOpen} onClose={() => setSellModalOpen(false)} />
            <DAOModal modelId={props.modelId} isOpen={isDAOModalOpen} onClose={() => setDAOModalOpen(false)} />
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
      <NextSeo title={`Inventory Models`} />

      <PageContainer>
        <Title value="Inventory Models" />
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
                daoMembers={1}
              />
            );
          })}
        </div>
      </PageContainer>
    </Layout>
  );
}

