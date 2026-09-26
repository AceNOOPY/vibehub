import type {
  ButtonVariant,
  ProjectPage,
  TextAlignment,
} from "@/db/project-document";

type ProjectPagePreviewProps = {
  page: ProjectPage;
};

const alignmentClasses: Record<
  TextAlignment,
  string
> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const buttonVariantClasses: Record<
  ButtonVariant,
  string
> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",
  secondary:
    "bg-slate-200 text-slate-900 hover:bg-slate-300",
  outline:
    "border border-slate-400 bg-transparent text-slate-900 hover:bg-slate-100",
};

function isHttpsHref(href: string) {
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

export function ProjectPagePreview({
  page,
}: ProjectPagePreviewProps) {
  return (
    <div className="space-y-4">
      {page.nodes.map((node) => {
        switch (node.type) {
          case "text": {
            const alignment =
              node.props.alignment ?? "left";

            return (
              <p
                key={node.id}
                className={
                  alignmentClasses[alignment]
                }
              >
                {node.props.text}
              </p>
            );
          }

          case "button": {
            const variant =
              node.props.variant ?? "primary";

            const isExternal = isHttpsHref(
              node.props.href,
            );

            return (
              <div key={node.id}>
                <a
                  href={node.props.href}
                  target={
                    isExternal
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    isExternal
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`inline-block rounded px-4 py-2 ${
                    buttonVariantClasses[variant]
                  }`}
                >
                  {node.props.label}
                </a>
              </div>
            );
          }
        }
      })}
    </div>
  );
}
