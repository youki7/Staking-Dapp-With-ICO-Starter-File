const Statistics = ({ poolDetails }) => {
  return (
    <div className="section">
      <div className="container">
        <div className="row">
          {poolDetails?.poolInfoArr.slice(0, 3).map((pool, index) => (
            <div key={index} className="col-12 col-sm-6 col-xl-3">
              <div className="stats">
                <span className="stats__value">
                  {pool?.depositAmount}&nbsp;{pool?.depositToken.symbol}
                </span>
                <p className="stats__name">Current APY:{pool?.apy} % </p>
              </div>
            </div>
          ))}

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stats">
              <span className="stats__value">
                {poolDetails?.totalDepositAmount}&nbsp;
                {poolDetails?.depositToken.symbol}
              </span>
              <p className="stats__name">Total Stake</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
