import { graphqlRequest } from './github-client.mjs';

function defaultLog(message) {
  console.log(`[issue-hygiene] ${message}`);
}

export async function updateProjectStatus(
  issueNodeId,
  config,
  { graphqlRequestFn = graphqlRequest, log = defaultLog } = {},
) {
  if (!config.projectNumber) {
    return null;
  }

  const projectQuery = `
    query IssueProjectLookup($login: String!, $projectNumber: Int!, $issueId: ID!) {
      organization(login: $login) {
        projectV2(number: $projectNumber) {
          id
          title
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2FieldCommon {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
      user(login: $login) {
        projectV2(number: $projectNumber) {
          id
          title
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2FieldCommon {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
      node(id: $issueId) {
        ... on Issue {
          projectItems(first: 100) {
            nodes {
              id
              project {
                ... on ProjectV2 {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const projectData = await graphqlRequestFn(projectQuery, {
    login: config.projectOwner,
    projectNumber: config.projectNumber,
    issueId: issueNodeId,
  });

  const project = projectData.organization?.projectV2 || projectData.user?.projectV2 || null;

  if (!project) {
    log(
      `Project ${config.projectOwner} #${config.projectNumber} was not found; skipping project sync.`,
    );
    return null;
  }

  const statusField = project.fields.nodes.find(
    (field) =>
      field?.name === config.statusFieldName && field.__typename === 'ProjectV2SingleSelectField',
  );

  if (!statusField) {
    log(
      `Project field "${config.statusFieldName}" was not found on project ${config.projectNumber}; skipping project sync.`,
    );
    return null;
  }

  const doneOption = statusField.options.find((option) => option.name === config.doneOptionName);

  if (!doneOption) {
    log(
      `Project option "${config.doneOptionName}" was not found on field "${config.statusFieldName}"; skipping project sync.`,
    );
    return null;
  }

  const projectItem = projectData.node?.projectItems?.nodes.find(
    (item) => item.project?.id === project.id,
  );

  if (!projectItem) {
    log(`Issue is not on project ${config.projectNumber}; skipping project sync.`);
    return null;
  }

  const mutation = `
    mutation UpdateProjectStatus(
      $projectId: ID!
      $itemId: ID!
      $fieldId: ID!
      $optionId: String!
    ) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  await graphqlRequestFn(mutation, {
    projectId: project.id,
    itemId: projectItem.id,
    fieldId: statusField.id,
    optionId: doneOption.id,
  });

  return `Updated project status to \`${config.doneOptionName}\``;
}
