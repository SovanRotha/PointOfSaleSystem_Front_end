import PendingOrder from "../ManagerComponent/PendingOrder";
import Payment from "../ManagerComponent/Payment";

function LiveOrder() {
  return (
    <div className="p-6 md:p-8 bg-slate-100 min-h-screen space-y-8">
      {/* Top Section: Kitchen Prep Board */}
      <PendingOrder />

      {/* Bottom Section: Payment Station */}
      <Payment />
    </div>
  );
}

export default LiveOrder;