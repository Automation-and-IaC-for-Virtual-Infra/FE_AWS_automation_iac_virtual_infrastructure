export default function AwsServices({ data }: { data: { count: number; services: any[] } }) {
  return (
    <div>
      <p className="m-2 text-center text-6xl">{data.count} AWS Services</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.services
          // .filter((service) => service.name.includes('AWS::S3'))
          .map((service) => (
            <div key={service.displayName} className="p-2 m-2 border border-ccc">
              <h3>{service.displayName}</h3>
              {/* <p>{service.documentation}</p> */}
              {/* <pre className="max-h-[200px] overflow-auto bg-gray-100 p-2 rounded text-black">
              {JSON.stringify(service.properties, null, 2)}
            </pre> */}
            </div>
          ))}
      </div>
    </div>
  )
}
