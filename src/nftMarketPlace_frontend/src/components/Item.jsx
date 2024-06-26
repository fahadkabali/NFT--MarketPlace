import React, { useEffect, useState } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { nftMarketPlace_backend } from "../../../declarations/nftMarketPlace_backend";
import CURRENT_USER_ID from "../main";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] =useState();
  const [loaderHidden, setLoaderHidden] = useState(true)
  const [blur, setBlur] = useState();
  const [SellStatus, setSellStatus] = useState("")
  const [PriceLabel, setPriceLabel] = useState()
  const [shouldDisplay, setDisplay] =useState(true)

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

    if(props.role=="collection"){
    const nftIsListed = await nftMarketPlace_backend.isListed(props.id);
      if(nftIsListed){
        setOwner("nft MarketPlace")
        setBlur({filter:"blur(4px)"})
        setSellStatus("LIsted")
      }else{
        setButton(<Button handleClick={handleSell} text={"Sell"}/>)
      }
    }else if(props.role=="discover"){
      const originalOwner = await nftMarketPlace_backend.getOriginalOwner(props.id)
      if(originalOwner.toText() != CURRENT_USER_ID.toText()){
        setButton(<Button handleClick={handleBuy} text={"Buy"}/>)
      }
    }
    const price = await nftMarketPlace_backend.getListedNFTPrice(props.id);
    setPriceLabel(<PriceLabel sellPrice= {price.toString()}/>)
  }

  useEffect(() => {
    loadNFT();
  }, []);
  // setLIsted("Listing")
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
  async function handleBuy() {
    display: shouldDisplay ? "inline" : "none"
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("bd3sg-teaaa-aaaaa-qaaba-cai"),
    });

    const sellerId = await nftMarketPlace_backend.getOriginalOwner(props.id);
    const itemPrice = await nftMarketPlace_backend.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice);
    if (result == "Success") {
      const transferResult = await nftMarketPlace_backend.completePurchase(
        props.id,
        sellerId,
        CURRENT_USER_ID
      );
      console.log("purchase: " + transferResult);
      setLoaderHidden(true);
      setDisplay(false);
    }
  }
 
  async function sellItem(){
    setBlur({filter:"blur(4px)"})
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
        setButton()
        setPriceInput()
        setOwner("NFT Market Place")
        setSellStatus("Listed")
      }
    }
  }


  return (
    <div style={{display: shouldDisplay ? "inline" : "none"}}className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          {PriceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text">{SellStatus}</span>
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