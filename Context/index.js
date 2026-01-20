import { BigNumber, ethers } from 'ethers'
import { toast } from 'react-hot-toast'
import {
  Contract,
  TOKEN_ICO_CONTRACT,
  ERC20,
  toEth,
  getStakingDappContract,
  getTokenContract,
} from './constants'
import Decimal from 'decimal.js'

const STAKING_DAPP_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP
const DEPOSIT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_DEPOSIT_TOKEN
const REWARD_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_REWARD_TOKEN
const TOEKN_LOGO = process.env.NEXT_PUBLIC_TOKEN_LOGO

export const notifySucces = (msg) => toast.success(msg, { duration: 2000 })
export const notifyError = (msg) => toast.error(msg, { duration: 2000 })

// FUNCTION

export const FORMAT_TIMESTAMP = (timestamp) => {
  const date = new Date(timestamp * 1000)
  const readableTime = date.toLocaleDateString('en-us', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return readableTime
}

const toWei = (amount) => {
  const toWei = ethers.utils.parseUnits(amount.toString())
  return toWei.toString()
}

const parseErrorMsg = (obj) => {
  return obj?.reason || obj?.error.message
}

export const SHORTEN_ADDRESS = (address) =>
  `${address?.slice(0, 8)}...${address?.slice(address.length - 4)}`

export const copyAddress = (text) => {
  navigator.clipboard.writeText(text)
  notifySucces('Copied successfully')
}

export const CONTRACT_DATA = async (address) => {
  try {
    if (!address) {
      return
    }

    const stakingContract = await getStakingDappContract()
    const stakingTokenContract = await getTokenContract()

    const stakingTokenOwner = await stakingContract.owner()
    const contractAddress = await stakingContract.address

    // Notifications
    const notification = await stakingContract.getNotifications()
    const _notificationArr = notification.map(
      ({ poolId, amount, user, message, timestamp }) => {
        return {
          poolId: poolId.toNumber(),
          amount: toEth(amount),
          user: user,
          message: message,
          timestamp: FORMAT_TIMESTAMP(timestamp),
        }
      }
    )

    let poolInfoArr = []
    const poolInfoLength = (await stakingContract.poolCount()).toNumber()
    for (let i = 0; i < poolInfoLength; i++) {
      const poolInfo = await stakingContract.poolInfo(i)
      const userInfo = await stakingContract.userInfo(i, address)
      const userReward = await stakingContract.pendingReward(i, address)
      const depositTokenInfo = await ERC20(poolInfo.depositToken, address)
      const rewardTokenInfo = await ERC20(poolInfo.rewardToken, address)

      const pool = {
        depositTokenAddress: poolInfo.depositToken,
        rewardTokenAddress: poolInfo.rewardToken,
        depositToken: depositTokenInfo,
        rewardToken: rewardTokenInfo,
        depositAmount: toEth(poolInfo.depositAmount.toString()),
        apy: poolInfo.apy.toString(),
        lockDays: poolInfo.lockDays.toString(),
        // USER
        amount: toEth(userInfo.amount.toString()),
        userReward: toEth(userReward),
        lockUntil: FORMAT_TIMESTAMP(userInfo.lockUntil.toNumber()),
        lastRewardAt: FORMAT_TIMESTAMP(userInfo.lastRewardAt.toNumber()),
      }
      poolInfoArr.push(pool)
    }

    const totalDepositAmount = poolInfoArr.reduce((total, pool) => {
      return total + parseFloat(pool.depositAmount)
    }, 0)

    const rewardToken = await ERC20(REWARD_TOKEN_ADDRESS, address)
    const depositToken = await ERC20(DEPOSIT_TOKEN_ADDRESS, address)

    const data = {
      contractOwner: stakingTokenOwner,
      contractAddress: contractAddress,
      notification: _notificationArr.reverse(),
      rewardToken: rewardToken,
      depositToken: depositToken,
      poolInfoArr: poolInfoArr,
      totalDepositAmount: totalDepositAmount,
      contractTokenBalance:
        depositToken.contractTokenBalance - totalDepositAmount,
    }

    return data
  } catch (error) {
    console.log(error)
    return parseErrorMsg(error)
  }
}

export const deposit = async (poolId, amount, address) => {
  try {
    notifySucces('calling contract...')
    const stakingContract = await getStakingDappContract()
    const tokenContract = await getTokenContract()

    const amountInWei = ethers.utils.parseEther(amount.toString())
    const userBalance = await tokenContract.balanceOf(address)

    if (userBalance.lt(amountInWei)) {
      notifyError('Please make sure you have enough tokens')
      return
    }

    const currentAllowance = await tokenContract.allowance(
      address,
      stakingContract.address
    )

    if (currentAllowance.lt(amountInWei)) {
      notifySucces('Approving token ...')
      const approveTx = await tokenContract.approve(
        stakingContract.address,
        amountInWei
      )

      await approveTx.wait()
      console.log(`Approved ${amountInWei.toString()} tokens for staking`)
    }

    const gasEstimation = await stakingContract.estimateGas.deposit(
      Number(poolId),
      amountInWei
    )

    notifySucces('Staking token call')
    const stakeTx = await stakingContract.deposit(poolId, amountInWei, {
      gasLimit: gasEstimation,
    })

    const receipt = await stakeTx.wait()
    notifySucces('Token take successfully')
    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const transferToken = async (amount, transferAddress) => {
  try {
    notifySucces('Calling contract token...')

    const tokenContract = await getTokenContract()
    const transferAmountInWei = ethers.utils.parseEther(amount)

    const approveTx = await tokenContract.transfer(
      transferAddress,
      transferAmountInWei
    )
    const receipt = await approveTx.wait()
    notifySucces('Token transfer successfullly')
    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const withdraw = async (poolId, amount) => {
  try {
    notifySucces('Calling contract ... ')

    const amountInWei = ethers.utils.parseEther(amount)

    const stakingContract = await getStakingDappContract()

    const gasEstimation = await stakingContract.estimateGas.withdraw(
      Number(poolId),
      amountInWei
    )

    const withdrawTx = await stakingContract.withdraw(
      Number(poolId),
      amountInWei,
      { gasLimit: gasEstimation }
    )

    const receipt = await withdrawTx.wait()
    notifySucces('Withdraw transaction successfully completed')

    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const claimReward = async (poolId) => {
  try {
    notifySucces('Calling contract ... ')
    const stakingContract = await getStakingDappContract()

    const gasEstimation = await stakingContract.estimateGas.claimReward(
      Number(poolId)
    )

    const claimTx = await stakingContract.claimReward(Number(poolId), {
      gasLimit: gasEstimation,
    })

    const receipt = await claimTx.wait()
    notifySucces('Reward claim successfully completed')

    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const createPool = async (pool) => {
  try {
    const { _depositToken, _rewardToken, _apy, _lockDays } = pool
    if (!_depositToken || !_rewardToken || !_apy || !_lockDays) {
      return notifyError('Provide all the details')
    }

    notifySucces('Calling contract ... ')

    const stakingContract = await getStakingDappContract()

    const gasEstimation = await stakingContract.estimateGas.addPool(
      _depositToken,
      _rewardToken,
      Number(_apy),
      Number(_lockDays)
    )

    const addPoolTx = await stakingContract.addPool(
      _depositToken,
      _rewardToken,
      Number(_apy),
      Number(_lockDays),
      {
        gasLimit: gasEstimation,
      }
    )

    const receipt = await addPoolTx.wait()
    notifySucces('Pool created successfully ')

    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const modifyPool = async (poolId, apy) => {
  try {
    notifySucces('Calling contract ... ')

    const stakingContract = await getStakingDappContract()

    const gasEstimation = await stakingContract.estimateGas.modifyPool(
      Number(poolId),
      Number(apy)
    )

    const modifyPoolTx = await stakingContract.modifyPool(
      Number(poolId),
      Number(apy),
      { gasLimit: gasEstimation }
    )

    const receipt = await modifyPoolTx.wait()
    notifySucces('Pool modified successfully ')

    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const sweep = async (tokenData) => {
  try {
    const { token, amount } = tokenData

    if (!token || !amount) {
      return notifyError('Data is missing')
    }

    notifySucces('Calling contract ... ')

    const stakingContract = await getStakingDappContract()

    const transferAmountInWei = ethers.utils.parseEther(amount.toString())

    const gasEstimation = await stakingContract.estimateGas.sweep(
      Number(poolId),
      Number(transferAmountInWei)
    )

    const sweepTx = await stakingContract.sweep(
      Number(poolId),
      Number(transferAmountInWei),
      { gasLimit: gasEstimation }
    )

    const receipt = await sweepTx.wait()
    notifySucces('Sweep successfully ')

    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

// ADD TOKEN METAMASK
export const addTokenToMetaMask = async () => {
  if (!window.ethereum) {
    return notifyError('MetaMask is not installed')
  }

  const tokenContract = await getTokenContract()
  const tokenAddress = tokenContract.address
  const tokenDecimals = await tokenContract.decimals()
  const tokenSymbol = await tokenContract.symbol()
  const tokenImage = TOEKN_LOGO

  try {
    const wasAdd = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    })

    if (wasAdd) {
      notifySucces('Token added')
    } else {
      notifyError('Failed to add token')
    }
  } catch (error) {
    notifyError('Failed to add token')
  }
}

// ICO CONTRACT
export const BUY_TOKEN = async (amount) => {
  try {
    const tokenIcoContract = await TOKEN_ICO_CONTRACT()
    const tokenDetails = await tokenIcoContract.getTokenDetails()

    const availableToken = ethers.utils.formatEther(
      tokenDetails.balance.toString()
    )
    if (availableToken <= 1) {
      return notifyError('Token balance is low than expected')
    }

    const payAmount = new Decimal(tokenDetails.tokenPrice.toString()).times(
      new Decimal(amount)
    )

    const buyTokenTx = await tokenIcoContract.buyToken(Number(amount), {
      value: payAmount.toString(),
      gasLimit: ethers.utils.hexlify(8000000),
    })
    const receipt = await buyTokenTx.wait()

    notifySucces('buy token successfully')
    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const WITHDRAW_TOKEN = async () => {
  try {
    notifySucces('calling contract')
    const tokenIcoContract = await TOKEN_ICO_CONTRACT()
    const tokenDetails = await tokenIcoContract.getTokenDetails()

    const availableToken = ethers.utils.formatEther(
      tokenDetails.balance.toString()
    )
    if (availableToken <= 1) {
      return notifyError('Token balance is low than expected')
    }

    const withdrawTx = await tokenIcoContract.withdrawAllTokens()
    const receipt = await withdrawTx.wait()

    notifySucces('withdraw successfully')
    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const UPDATE_TOKEN = async (_address) => {
  try {
    if (!_address) {
      return notifyError('Data is missing')
    }

    notifySucces('calling contract')
    const tokenIcoContract = await TOKEN_ICO_CONTRACT()

    const gasEstimation = await tokenIcoContract.estimateGas.updateToken(
      _address
    )

    const updateTx = await tokenIcoContract.updateToken(_address, {
      gasLimit: gasEstimation,
    })

    const receipt = await updateTx.wait()
    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}

export const UPDATE_TOKEN_PRICE = async (_price) => {
  try {
    if (!_price) {
      return notifyError('Data is missing')
    }

    notifySucces('calling contract')
    const tokenIcoContract = await TOKEN_ICO_CONTRACT()

    const priceInWei = ethers.utils.parseEther(_price.toString())
    const gasEstimation =
      await tokenIcoContract.estimateGas.udpateTokenSalePrice(priceInWei)

    const updateTx = await tokenIcoContract.udpateTokenSalePrice(priceInWei, {
      gasLimit: gasEstimation,
    })
    const receipt = await updateTx.wait()
    return receipt
  } catch (error) {
    console.log(error)
    const errorMsg = parseErrorMsg(error)
    notifyError(errorMsg)
  }
}
