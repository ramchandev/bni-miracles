type JsonLdValue = Record<string, unknown>;

type Props = {
  data: JsonLdValue | JsonLdValue[];
};

/** Renders Schema.org JSON-LD for search engines */
export default function JsonLd({ data }: Props) {
  const graphs = Array.isArray(data) ? data : [data];

  return (
    <>
      {graphs.map((graph, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  );
}
