import React, { useEffect, useState } from "react";
import logo from "/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { nftMarketPlace_backend } from "../../../declarations/nftMarketPlace_backend";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] =useState();
  const [loaderHidden, setLoaderHidden] = useState(true)

  const id = props.id;

  const localHost = "http://localhost:3000/";
  const agent = new HttpAgent({ host: localHost });


  agent.fetchRootKey();
  let NFTActor;
  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );

    setName(name);
    setOwner(owner.toText());
    setImage(image);

    setButton(<Button handleClick={handleSell} text={"sell"}/>)
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price
  function handleSell() {
    console.log("Sell NFT");
    setPriceInput(
      <input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={e => price= e.target.value}
      />
    )
    setButton(<Button handleClick={sellItem} text={"confirm"}/>)
    // router.push(`/resell-nft?id=${id}`);
  }
  async function sellItem(){
    setLoaderHidden(false)
    console.log("confirm clicked")
    const listingResult = await nftMarketPlace_backend.listItem(props.id, Number(price))
    console.log("listing:"+ listingResult)
    if(listingResult == "Success"){
      const nftMarketPlaceId = await nftMarketPlace_backend.getNftMarketPlaceCanisterID(props.id)
      const transferResult = await NFTActor.transferOwnership(nftMarketPlaceId)
      console.log("transfer:"+ transferResult)
      if(transferResult=='Success'){
        setLoaderHidden(true)
      }
    }
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;