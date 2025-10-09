"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import RoleCard from "@/components/RoleCard";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/components/auth/firebase";

// Define available roles
const ROLES = [
  { id: "OPERATOR", label: "Operator", description: "Monitor and control operations", icon: "user" },
  { id: "SUPERVISOR", label: "Supervisor", description: "Oversee team and processes", icon: "users" },
  { id: "PROCESS_ENGINEER", label: "Process Engineer", description: "Optimize and analyze processes", icon: "chart" },
  { id: "MAINTENANCE", label: "Maintenance", description: "Equipment upkeep and repairs", icon: "wrench" },
  { id: "PLANT_MANAGER", label: "Plant Manager", description: "Overall plant management", icon: "settings" },
  { id: "NMDC_ADMIN", label: "NMDC Admin", description: "System administration", icon: "shield" },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateRoles, roles } = useAuth();
  
  const userEmail = user?.email || "user@example.com";

  // Redirect if user already has a role
  useEffect(() => {
    if (user && roles.length > 0) {
      router.push("/");
    }
  }, [user, roles, router]);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;
    
    setLoading(true);
    
    try {
      // Save selected role to Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      
      // Check if user document exists
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, { 
          role: selectedRole,
          updatedAt: new Date(),
        });
      } else {
        // Create new document
        await setDoc(userDocRef, {
          email: user.email,
          role: selectedRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Update local RBAC system
      updateRoles(user.email, [selectedRole]);
      
      console.log("Role saved successfully:", selectedRole);
      router.push("/");
      
    } catch (error) {
      console.error("Error saving role:", error);
      // You could add a toast notification here for better UX
      alert("Failed to save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <span className="font-medium">Logged in as:</span>
            <span className="text-gray-900 font-semibold">{userEmail}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Select Your Role
          </h1>
          <p className="text-gray-600 text-lg">
            Choose the role that best describes your position
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              id={role.id}
              label={role.label}
              description={role.description}
              icon={role.icon}
              isSelected={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
            />
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className={`
              px-8 py-3 rounded-lg font-semibold text-white text-lg
              transition-all duration-200 transform
              ${
                selectedRole && !loading
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }
              focus:outline-none focus:ring-4 focus:ring-blue-300
              disabled:transform-none
            `}
            aria-label="Continue to dashboard"
          >
            {loading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </div>

        {/* Helper Text */}
        {!selectedRole && !loading && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Please select a role to continue
          </p>
        )}
        
        {loading && (
          <p className="text-center text-sm text-blue-600 mt-4">
            Saving your role selection...
          </p>
        )}
      </div>
    </div>
  );
}