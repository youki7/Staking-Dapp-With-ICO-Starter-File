import React, { useState } from 'react'

import { IoMdClose } from './ReactICON'
import PopUpInputField from './Admin/RegularComp/PopUpInputField'
import PopUpButton from './Admin/RegularComp/PopUpButton'

const WithdrawModal = ({
  withdraw,
  withdrawPoolId,
  address,
  setLoader,
  claimReward,
}) => {
  const [amount, setAmount] = useState()
  const CALLING_FUNCTION = async (amount) => {
    setLoader(true)
    const receipt = await withdraw(withdrawPoolId, amount, address)
    if (receipt?.blockNumber) {
      setLoader(false)
      window.location.reload()
    }
    setLoader(false)
  }

  const CALLING_CLAIM = async () => {
    setLoader(true)
    const receipt = await claimReward(withdrawPoolId)
    if (receipt?.blockNumber) {
      setLoader(false)
      window.location.reload()
    }
    setLoader(false)
  }
  return (
    <div
      className="modal modal--auto fade"
      id="modal-node"
      tabIndex={-1}
      aria-labelledby="modal-node"
      aria-hidden
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal__content">
            <button
              className="modal__close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="ti ti-x">
                <IoMdClose />
              </i>
            </button>
            <h4 className="modal__title">Withdraw Token</h4>
            <div className="modal__form">
              <PopUpInputField
                title="Amount"
                placeholder="Amount" 
                handleChange={(e) => setAmount(e.target.value)}
              />
              <PopUpButton
                title="Withdraw"
                handleClick={() => CALLING_FUNCTION(amount)}
              />
              <PopUpButton
                title="Claim Reward"
                handleClick={() => CALLING_CLAIM()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WithdrawModal
