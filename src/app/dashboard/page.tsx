import Dashboard from "./container/dashboard"
import ProtectedRoute from "../protectedRoute"



export default function page() {
    return(
       <ProtectedRoute>
         <div>
          <Dashboard/>
        </div>
       </ProtectedRoute>
    )
}