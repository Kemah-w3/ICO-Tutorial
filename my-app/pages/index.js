import Head from "next/head"
import { useEffect, useState, useRef } from "react"
import styles from "../styles/Home.module.css"
import { 
  TOKEN_CONTRACT_ADDRESS, 
  TOKEN_CONTRACT_ABI, 
  NFT_CONTRACT_ADDRESS, 
  NFT_CONTRACT_ABI 
} from "../constants"
import Web3Modal from "web3modal"
import { providers, BigNumber, Contract, utils } from "ethers"


export default function Home() {

const zero = BigNumber.from(0)
const [walletConnected, setWalletConnected] = useState(false)
const web3ModalRef = useRef()
const [tokenMinted, setTokenMinted] = useState(zero)
const [balanceOfCryptoDevsToken, setBalanceOfCryptoDevsToken] = useState(zero)
const [tokenAmount, setTokenAmount] = useState(zero)
const [loading, setLoading] = useState(false)
const [tokensToBeClaimed, setTokensToBClaimed] = useState(zero)

const getProviderOrSigner = async (needSigner = false) => {
  const provider = await web3ModalRef.current.connect()
  const web3Provider = new providers.Web3Provider(provider)
  const  { chainId } = await web3Provider.getNetwork()

  if(chainId !== 4) {
    window.alert("Wrong Network! Connect to Rinkeby")
    throw new Error("Connect to Rinkeby Network")
  }

  if(needSigner) {
    const signer = web3Provider.getSigner()
    return signer
  }
  return web3Provider
}

const connectWallet = async () => {
  try {
    await getProviderOrSigner()
    setWalletConnected(true)
  } catch (error) {
    console.error(error)
  }
}

useEffect(() => {
  if(!walletConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      providerOptions: {},
      disableInjectedProvider: false
    })
    connectWallet()
    getBalanceOfCryptoDevToken()
    getTotalTokemMinted()
    getTokensToBeClaimed()
  }
}, [walletConnected])

const getBalanceOfCryptoDevToken = async () => {
  try {
    const provider = await getProviderOrSigner()
    const cryptoDevContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    )

    const signer = await getProviderOrSigner(true)
    const addressOfSigner = await signer.getAddress() 
    const balance = await cryptoDevContract.balanceOf(addressOfSigner)
    setBalanceOfCryptoDevsToken(balance)

  } catch (error) {
    console.error(error)
  }
}

const getTotalTokemMinted = async () => {
  try {
    const provider = await getProviderOrSigner()
    const cryptoDevContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    )

    const _tokensMinted = await cryptoDevContract.totalSupply()
    setTokenMinted(_tokensMinted)

  } catch (error) {
    console.error(error)
  }
}

const mintCryptoDevToken = async (amount) => {
  try {
    const signer = await getProviderOrSigner(true)
    const cryptoDevContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    )

    const totalValue = 0.01 * amount
    const tx = await cryptoDevContract.mint(amount, {
      value: utils.parseEther(totalValue.toString())
    })

    setLoading(true)
    await tx.wait()
    setLoading(false)
    window.alert("Transaction Successful!")
    await getBalanceOfCryptoDevToken()
    await getTotalTokemMinted()
    await getTokensToBeClaimed()

  } catch (error) {
    console.error(error)
  }
}

const getTokensToBeClaimed = async () => {
  try {
    const provider = await getProviderOrSigner()
    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    )
    const cryptoDevContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    )

    const signer = await getProviderOrSigner(true)
    const address = await signer.getAddress()
    const balance = await nftContract.balanceOf(address)

    if(balance === zero) {
      setTokensToBClaimed(zero)
    } else {
      var amount = 0 
      for(var i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
        const claimed = await cryptoDevContract.tokenIdsClaimed(tokenId)
        if(!claimed) {
          amount++
        }
      }
      setTokensToBClaimed(BigNumber.from(amount))
    }
  } catch (error) {
    console.error(error)
    setTokensToBClaimed(zero)
  }
}

const claimCryptoDevToken = async () => {
  try {
    const signer = await getProviderOrSigner(true)
    const cryptoDevContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    )
    const tx = await cryptoDevContract.claim()
    setLoading(true)
    await tx.wait()
    setLoading(false)
    window.alert("You have successfully claimed your tokens")
    await getBalanceOfCryptoDevToken()
    await getTotalTokemMinted()
    await getTokensToBeClaimed()

  } catch (error) {
    console.error(error)
  }
}

const renderButton = () => {
  if(loading) {
    return(
      <button className={styles.button}>
        Loading... 
      </button>
    )
  }

  if(tokensToBeClaimed > 0) {
    return(
      <div>
        <div className={styles.description}>
          You have {tokensToBeClaimed * 10} tokens to claim
        </div>
        <button className={styles.button} onClick={claimCryptoDevToken}>
          Claim Tokens
        </button>
      </div>
    )
  }
  return(
    <div style={{display: "flex"}}>
      <div>
        <input 
          type="number" 
          placeholder="Amount of Tokens"
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          className={styles.input}
        />
      </div>
      
      <button 
        className={styles.button} 
        disabled={!(tokenAmount > 0)}
        onClick={() => mintCryptoDevToken(tokenAmount)}>
        Mint Token
      </button>
    </div>
  )
}


  return(
    <div>
      <Head>
        <title>CRYPTO DEVS ICO</title>
        <meta name="description" content="ICO dApp"/>
        <link rel="icon" href="./favicon.ico"/>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome To CryptoDevs ICO</h1>
          <div className={styles.description}>
            You can claim your Crypto Devs Token here!
          </div>
          <div>
            {
              walletConnected ? (
                <div>
                  <div className={styles.description}>
                    You have minted {utils.formatEther(balanceOfCryptoDevsToken)} CryptoDevs token
                  </div>
                  <div className={styles.description}>
                    {/* utils.formatEther is used to convert a BigNumber to a string */}
                    Overall {utils.formatEther(tokenMinted)}/10000 CryptoDevs Token have been minted!
                  </div>
                  {renderButton()}
                </div>
              ) : (
                <button className={styles.button}>
                  Connect Wallet
                </button>
              )
            }
          </div>
        </div>
        
        <div>
          <img className={styles.image} src="./cryptoDev.svg"/>
        </div>

      </div>
      <footer className={styles.footer}>
        Made with 💙 for CryptoDevs
      </footer>
    </div>
  )
}