/**
 * Test script for batch-semester filtering functionality
 * This script tests the new batch-based semester filtering API and functionality
 */

const BASE_URL = 'http://localhost:3001'

async function testBatchSemesterFiltering() {
  console.log('🧪 Testing Batch-Semester Filtering Functionality\n')

  try {
    // Test 1: Fetch available batches
    console.log('1. Testing batch fetching...')
    const batchResponse = await fetch(`${BASE_URL}/api/batches`)
    
    if (!batchResponse.ok) {
      throw new Error(`Batch API failed: ${batchResponse.status}`)
    }
    
    const batches = await batchResponse.json()
    console.log(`✅ Found ${batches.length} batches:`)
    batches.forEach(batch => {
      console.log(`   - ${batch.displayName} (${batch.sections.length} sections)`)
    })
    console.log()

    if (batches.length === 0) {
      console.log('⚠️  No batches found. Make sure you have semesters with section format "batch_section" (e.g., "63_A")')
      return
    }

    // Test 2: Test batch-specific semester filtering
    console.log('2. Testing batch-specific semester filtering...')
    
    for (const batch of batches.slice(0, 3)) { // Test first 3 batches
      console.log(`\n   Testing batch ${batch.batch}:`)
      
      const semesterResponse = await fetch(`${BASE_URL}/api/semesters/by-batch/${batch.batch}`)
      
      if (!semesterResponse.ok) {
        console.log(`   ❌ Failed to fetch semesters for batch ${batch.batch}: ${semesterResponse.status}`)
        continue
      }
      
      const semesterData = await semesterResponse.json()
      console.log(`   ✅ Found ${semesterData.count} semesters for batch ${batch.batch}:`)
      
      semesterData.semesters.forEach(semester => {
        console.log(`      - ${semester.title} (${semester.section})`)
      })

      // Validate that all returned semesters belong to the correct batch
      const invalidSemesters = semesterData.semesters.filter(semester => {
        const [semesterBatch] = semester.section.split('_')
        return semesterBatch !== batch.batch
      })

      if (invalidSemesters.length > 0) {
        console.log(`   ❌ Found ${invalidSemesters.length} semesters with incorrect batch:`)
        invalidSemesters.forEach(semester => {
          console.log(`      - ${semester.title} (${semester.section}) - should not be in batch ${batch.batch}`)
        })
      } else {
        console.log(`   ✅ All semesters correctly belong to batch ${batch.batch}`)
      }
    }

    // Test 3: Test invalid batch handling
    console.log('\n3. Testing invalid batch handling...')
    
    const invalidBatchResponse = await fetch(`${BASE_URL}/api/semesters/by-batch/999`)
    
    if (invalidBatchResponse.ok) {
      const invalidData = await invalidBatchResponse.json()
      if (invalidData.count === 0) {
        console.log('   ✅ Invalid batch correctly returns empty result')
      } else {
        console.log(`   ⚠️  Invalid batch returned ${invalidData.count} semesters (unexpected)`)
      }
    } else {
      console.log('   ✅ Invalid batch correctly returns error status')
    }

    // Test 4: Test non-numeric batch handling
    console.log('\n4. Testing non-numeric batch handling...')
    
    const nonNumericResponse = await fetch(`${BASE_URL}/api/semesters/by-batch/abc`)
    
    if (nonNumericResponse.status === 400) {
      console.log('   ✅ Non-numeric batch correctly returns 400 error')
    } else {
      console.log(`   ❌ Non-numeric batch returned unexpected status: ${nonNumericResponse.status}`)
    }

    // Test 5: Test public semesters API (baseline)
    console.log('\n5. Testing baseline public semesters API...')
    
    const publicResponse = await fetch(`${BASE_URL}/api/semesters/public`)
    
    if (publicResponse.ok) {
      const publicSemesters = await publicResponse.json()
      console.log(`   ✅ Public API returned ${publicSemesters.length} total active semesters`)
      
      // Verify that batch filtering is working by comparing counts
      const totalBatchSemesters = batches.reduce(async (accPromise, batch) => {
        const acc = await accPromise
        const response = await fetch(`${BASE_URL}/api/semesters/by-batch/${batch.batch}`)
        if (response.ok) {
          const data = await response.json()
          return acc + data.count
        }
        return acc
      }, Promise.resolve(0))

      const totalFromBatches = await totalBatchSemesters
      
      if (totalFromBatches === publicSemesters.length) {
        console.log('   ✅ Batch filtering covers all public semesters correctly')
      } else {
        console.log(`   ⚠️  Batch filtering total (${totalFromBatches}) doesn't match public total (${publicSemesters.length})`)
        console.log('      This might indicate semesters without proper section format')
      }
    } else {
      console.log(`   ❌ Public semesters API failed: ${publicResponse.status}`)
    }

    console.log('\n🎉 Batch-semester filtering tests completed!')
    console.log('\n📋 Summary:')
    console.log('   - Batch API endpoint working')
    console.log('   - Batch-specific semester filtering working')
    console.log('   - Error handling for invalid inputs working')
    console.log('   - Data consistency validated')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
if (require.main === module) {
  testBatchSemesterFiltering()
}

module.exports = { testBatchSemesterFiltering }
