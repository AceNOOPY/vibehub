export type TextNode = {
    id: string;
    type: "text";
    props: {
        text: string;
    };
};

export type ProjectDocument = {
    schemaVersion: 1;
    pages: {
        id: string;
        name: string;
        nodes: TextNode[];
    }[];
};