// Automated Unit & Integration Tests for E-Commerce Platform
const assert = require('assert');
const { db } = require('../source/db');

console.log('Running test suite for E-Commerce Platform...');

// Test 1: CRUD Operations
const primaryTable = 'users';
const created = db.insert(primaryTable, { title: 'Test Record Alpha', tenant_id: 'test_org' });
assert(created && created.id, 'Record insertion failed');
console.log('  ✓ Insert Record: PASS');

const found = db.findById(primaryTable, created.id);
assert(found && found.title === 'Test Record Alpha', 'Record lookup failed');
console.log('  ✓ Query Record: PASS');

const updated = db.update(primaryTable, created.id, { title: 'Test Record Alpha (Updated)' });
assert(updated && updated.title.includes('Updated'), 'Record update failed');
console.log('  ✓ Update Record: PASS');

const deleted = db.delete(primaryTable, created.id);
assert(deleted === true, 'Record deletion failed');
assert(db.findById(primaryTable, created.id) === null, 'Deleted record still exists');
console.log('  ✓ Delete Record: PASS');

// Test 2: Multi-Tenant Isolation
const tenantA = db.insert(primaryTable, { title: 'Tenant A Secret Data', tenant_id: 'tenant_A' });
const tenantBItems = db.find(primaryTable, { tenant_id: 'tenant_B' });
assert(!tenantBItems.some(i => i.id === tenantA.id), 'Cross-tenant data leaked!');
console.log('  ✓ Multi-Tenant Isolation: PASS');

console.log('All tests passed for E-Commerce Platform!');
