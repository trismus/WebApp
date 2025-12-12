import React from 'react';
import '../styles/RoleBadge.css';

const RoleBadge = ({ role }) => {
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'administrator':
        return 'role-badge-admin';
      case 'operator':
        return 'role-badge-operator';
      case 'user':
        return 'role-badge-user';
      default:
        return 'role-badge-default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrator':
        return 'Admin';
      case 'operator':
        return 'Operator';
      case 'user':
        return 'User';
      default:
        return role;
    }
  };

  if (!role) return null;

  return (
    <span className={`role-badge ${getRoleBadgeClass(role)}`}>
      {getRoleLabel(role)}
    </span>
  );
};

export default RoleBadge;
