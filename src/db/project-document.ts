export type TextNode = {
    id: string;
    type: "text";
    props: {
        text: string;
    };
};

export type ButtonNode = {
    id: string;
    type: "button";
    props: {
        label: string;
        href: string;
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