import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

// INTERNAL IMPORT
import { Header, Footer, Loader, ICOSale } from '../Components/index'
import Admin from '../Components/Admin/Admin'
import AdminHead from '../Components/Admin/AdminHead'
import UpdateAPYModal from '../Components/Admin/UpdateAPYModal'
import Auth from '../Components/Admin/Auth'

import {
  CONTRACT_DATA,
  transferToken,
  createPool,
  sweep,
  modifyPool,
} from '../Context/index'

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS

const admin = () => {
  const { address } = useAccount()
  const [loader, setLoader] = useState(false)
  const [checkAdmin, setCheckAmind] = useState(true) // whether to show the not authorized error modal

  const [poolDetails, setPoolDetails] = useState()
  const [modifyPoolId, setModifyPoolId] = useState()

  const LOAD_DATA = async () => {
    setLoader(true)
    if (
      !address ||
      address.toLocaleLowerCase() != ADMIN_ADDRESS.toLowerCase()
    ) {
      setCheckAmind(true)
    } else {
      setCheckAmind(false)
      const data = await CONTRACT_DATA(address)
      console.log(data)
      setPoolDetails(data)
    }

    setLoader(false)
  }

  useEffect(() => {
    LOAD_DATA()
  }, [address])

  return (
    <>
      <Header page={'admin'} />
      <AdminHead />
      <Admin
        poolDetails={poolDetails}
        transferToken={transferToken}
        address={address}
        setLoader={setLoader}
        createPool={createPool}
        sweep={sweep}
        setModifyPoolId={setModifyPoolId}
      />
      <Footer />

      <UpdateAPYModal
        setLoader={setLoader}
        modifyPool={modifyPool}
        modifyPoolId={modifyPoolId}
      />
      <ICOSale setLoader={setLoader} />

      {checkAdmin && <Auth />}
      {loader && <Loader />}
    </>
  )
}

export default admin
