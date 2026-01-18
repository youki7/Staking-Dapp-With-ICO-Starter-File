import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

// INTERNAL IMPORT
import {
  Header,
  HeroSection,
  Footer,
  Pools,
  PoolsModel,
  WithdrawModal,
  Withdraw,
  Partners,
  Statistics,
  Token,
  Loader,
  Notification,
  ICOSale,
  Contact,
  Ask,
} from '../Components/index'

import {
  CONTRACT_DATA,
  deposit,
  withdraw,
  claimReward,
  addTokenToMetaMask,
} from '../Context/index'

const index = () => {
  const { address } = useAccount()
  const [loader, setLoader] = useState(false)
  const [contactUs, setContactUs] = useState(false)
  const [poolId, setPoolId] = useState()
  const [withdrawPoolId, setWithdrawPoolId] = useState()
  const [poolDetails, setPoolDetails] = useState()
  const [selectedPool, setSelectedPool] = useState()
  const [selectedToken, setSelectedToken] = useState()

  const LOAD_DATA = async () => {
    if (address) {
      setLoader(true)
      const data = await CONTRACT_DATA(address)
      console.log(data)
      setPoolDetails(data)
      setLoader(false)
    }
  }

  useEffect(() => {
    LOAD_DATA(address)
  }, [address])
  return (
    <>
      <Header/>
      <HeroSection
        poolDetails={poolDetails}
        addTokenToMetaMask={addTokenToMetaMask}
      />
      <Statistics poolDetails={poolDetails} />
      <Pools
        setPoolId={setPoolId}
        poolDetails={poolDetails}
        setSelectedPool={setSelectedPool}
        setSelectedToken={setSelectedToken}
      />

      <Token poolDetails={poolDetails} />
      <Withdraw
        setWithdrawPoolId={setWithdrawPoolId}
        poolDetails={poolDetails}
      />

      <Notification poolDetails={poolDetails} />
      <Partners />
      <Ask setContactUs={setContactUs} />
      <Footer></Footer>

      {/* MODAL */}
      <PoolsModel
        deposit={deposit}
        poolId={poolId}
        address={address}
        selectedPool={selectedPool}
        selectedToken={selectedToken}
        setLoader={setLoader}
      />
      <WithdrawModal
        withdraw={withdraw}
        withdrawPoolId={withdrawPoolId}
        address={address}
        setLoader={setLoader}
        claimReward={claimReward}
      />
      <ICOSale setLoader={setLoader} />

      {contactUs && <Contact setContactUs={setContactUs} />}
      {loader && <Loader />}
    </>
  )
}

export default index
