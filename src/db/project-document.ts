export type TextNode = {
    id: string;
    type: "text";
    props: {
        text: string;
        alignment?: TextAlignment;
    };
};

export type ButtonNode = {
    id: string;
    type: "button";
    props: {
        label: string;
        href: string;
        variant?: ButtonVariant;
    };
};

export type ProjectNode = TextNode | ButtonNode;

export type ProjectPage = {
    id: string;
    name: string;
    nodes: ProjectNode[];
};

export type ProjectDocument = {
    schemaVersion: 1;
    pages: ProjectPage[];
};

export type TextAlignment =
    | "left"
    | "center"
    | "right";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline";