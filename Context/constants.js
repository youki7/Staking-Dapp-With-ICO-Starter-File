import { ether, ethers } from 'ethers'
import StakingDappABI from './StakingDapp.json'
import TokenICO from './TokenICO.json'
import TerryTokenABI from './ERC20.json'

// CONTRACT
const STAKING_DAPP_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP
const TOKEN_ICO_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ICO

// TOKEN
const DEPOSIT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_DEPOSIT_TOKEN
const REWARD_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_REWARD_TOKEN

export const toEth = (amount, decimal = 18) => {
  const eth = ethers.utils.formatEther(amount, decimal)
  return eth.toString()
}

export const getTokenContract = async () => {
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)

  if (!ethereum) {
    return null
  }

  const signer = provider.getSigner()
  const tokenContract = new ethers.Contract(
    DEPOSIT_TOKEN_ADDRESS,
    TerryTokenABI.abi,
    signer
  )

  return tokenContract
}

export const getStakingDappContract = async () => {
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)
  if (!ethereum) {
    return null
  }

  const signer = provider.getSigner()
  const stakingDappContract = new ethers.Contract(
    STAKING_DAPP_ADDRESS,
    StakingDappABI.abi,
    signer
  )
  return stakingDappContract
}

export const ERC20 = async (address, userAddress) => {
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)

  if (!ethereum) {
    return null
  }

  const signer = provider.getSigner()
  const contract = new ethers.Contract(address, TerryTokenABI.abi, signer)

  const token = {
    name: await contract.name(),
    symbol: await contract.symbol(),
    address: await contract.address,
    supply: toEth(await contract.totalSupply()),
    balance: toEth(await contract.balanceOf(userAddress)),
    contractTokenBalance: toEth(await contract.balanceOf(STAKING_DAPP_ADDRESS)),
  }
  return token
}

// TOKEN ICO CONTRACT

export const LOAD_TOKEN_ICO = async () => {
  try {
    const icoContract = TOKEN_ICO_CONTRACT()
    const tokenAddress = await icoContract.tokenAddress()
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000
    // maybe icoContract hasn't set a token
    if (tokenAddress == ZERO_ADDRESS) {
      return
    }

    const tokenDetails = await icoContract.getTokenDetails()
    const token = {
      tokenBal: toEth(tokenDetails.balance),
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      supply: toEth(tokenDetails.supply),
      tokenPrice: toEth(tokenDetails.tokenPrice),
      tokenAddress: tokenDetails.token,
      owner: (await icoContract.owner()).toLowerCase(),
      soldTokens: (await icoContract.soldTokens()).toNumber(),
      token: await TOKEN_ICO_ERC20(),
    }
    return token
  } catch (error) {
    console.log(error)
  }
}

export const TOKEN_ICO_CONTRACT = () => {
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)

  if (!ethereum) {
    return null
  }

  const signer = provider.getSigner()
  const tokenIcoContract = new ethers.Contract(
    TOKEN_ICO_ADDRESS,
    TokenICO.abi,
    signer
  )
  return tokenIcoContract
}

export const TOKEN_ICO_ERC20 = async () => {
  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)

  if (!ethereum) {
    return null
  }

  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    DEPOSIT_TOKEN_ADDRESS,
    TerryTokenABI.abi,
    signer
  )

  // USER ADDRESS
  const userAddress = await signer.getAddress()

  const token = {
    address: await contract.address,
    name: await contract.name(),
    symbol: await contract.symbol(),
    decimals: await contract.decimals(),
    supply: toEth(await contract.totalSupply()),
    balance: toEth(await contract.balanceOf(userAddress)),
    contractTokenBalance: toEth(await contract.balanceOf(STAKING_DAPP_ADDRESS)),
    nativeBalance: toEth(await signer.getBalance()),
  }
  return token
}
