import { getAuthenticatedOctokit, testGitHubAuth } from './src/utils/githubAuth.ts';

async function testConnection() {
  console.log('🔍 Testing GitHub App connection...\n');

  try {
    // Test basic authentication
    console.log('1. Testing GitHub App authentication...');
    const isAuthenticated = await testGitHubAuth();

    if (isAuthenticated) {
      console.log('✅ GitHub App authentication successful!\n');

      // Test fetching organization info
      console.log('2. Testing organization access...');
      const octokit = await getAuthenticatedOctokit();

      try {
        const { data: org } = await octokit.rest.orgs.get({
          org: 'kyndig',
        });
        console.log(`✅ Successfully connected to organization: ${org.name}`);
        console.log(`   - Organization ID: ${org.id}`);
        console.log(`   - Public repos: ${org.public_repos}`);
        console.log(`   - Total repos: ${org.public_repos + org.total_private_repos}\n`);

        // Test searching for repositories with kynd-labs topic
        console.log('3. Testing repository search with kynd-labs topic...');
        const { data: repos } = await octokit.rest.search.repos({
          q: 'org:kyndig topic:kynd-labs',
          sort: 'updated',
          order: 'desc',
          per_page: 10,
        });

        console.log(`✅ Found ${repos.items.length} repositories with kynd-labs topic:`);
        repos.items.forEach((repo, index) => {
          console.log(`   ${index + 1}. ${repo.name} (${repo.private ? 'Private' : 'Public'})`);
          console.log(`      - Stars: ${repo.stargazers_count}`);
          console.log(`      - Topics: ${repo.topics?.join(', ') || 'None'}`);
          console.log(`      - Last updated: ${new Date(repo.updated_at).toLocaleDateString()}`);
        });

        if (repos.items.length === 0) {
          console.log('⚠️  No repositories found with kynd-labs topic.');
          console.log(
            '   Make sure to add the "kynd-labs" topic to repositories you want to include.',
          );
        }
      } catch (orgError) {
        console.log('❌ Failed to access kyndig organization:');
        console.log(`   Error: ${orgError.message}`);
        console.log(
          '   This might indicate insufficient permissions or the app is not installed on the organization.',
        );
      }
    } else {
      console.log('❌ GitHub App authentication failed!');
      console.log('   Please check your environment variables:');
      console.log('   - GITHUB_APP_ID');
      console.log('   - GITHUB_APP_INSTALLATION_ID');
      console.log('   - GITHUB_APP_PRIVATE_KEY');
    }
  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Verify your .env file contains the correct GitHub App credentials');
    console.log('   2. Ensure the GitHub App is installed on the kyndig organization');
    console.log('   3. Check that the GitHub App has the required permissions');
    console.log('   4. Verify the private key format (should include \\n for newlines)');
  }
}

// Run the test
testConnection().catch(console.error);
