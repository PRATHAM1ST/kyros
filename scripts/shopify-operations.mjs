export const AUDIT = `query CatalogRepairAudit {
  shop {name currencyCode plan {partnerDevelopment}}
  publications(first: 50) {nodes {id name}}
  products(first: 100, query: "product_type:'Diamond Engagement Ring' OR product_type:'Loose Diamond' OR product_type:'Ring Setting'") {
    nodes {id handle title productType status tags descriptionHtml
      media(first: 30) {nodes {id ... on MediaImage {image {url}}}}
      metafields(first: 50) {nodes {namespace key type value}}
      options {id name optionValues {id name}}
      variants(first: 250) {nodes {id title price selectedOptions {name value}}}
    }
  }
}`;
export const UPSERT = `mutation RepairProduct($input: ProductSetInput!) {
  productSet(input: $input, synchronous: true) {
    product {id handle variants(first: 250) {nodes {id title price selectedOptions {name value}}}}
    userErrors {field message code}
  }
}`;
export const DEFINITION = `mutation SpecsDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {createdDefinition {id} userErrors {field message code}}
}`;
export const METAFIELDS = `mutation RepairSpecifications($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {metafields {id key} userErrors {field message code}}
}`;
export const PUBLISH = `mutation PublishCatalog($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {userErrors {field message}}
}`;
