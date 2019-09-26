use kurs;

CREATE TABLE ege (
    napravl_napr_id   INTEGER NOT NULL,
    ege               VARCHAR(16) NOT NULL
);

CREATE TABLE napravl (
    napr_id      INTEGER NOT NULL,
    napr_name    VARCHAR(64) NOT NULL,
    ball         INTEGER NOT NULL,
    tags         VARCHAR(128),
    vuz_vuz_id   INTEGER NOT NULL
);

ALTER TABLE napravl ADD CONSTRAINT napravl_pk PRIMARY KEY ( napr_id );

CREATE TABLE vuz (
    vuz_id       INTEGER NOT NULL,
    vuz_name     VARCHAR(128) NOT NULL,
    vuz_cities   VARCHAR(128) NOT NULL
);

ALTER TABLE vuz ADD CONSTRAINT vuz_pk PRIMARY KEY ( vuz_id );

ALTER TABLE ege
    ADD CONSTRAINT ege_napravl_fk FOREIGN KEY ( napravl_napr_id )
        REFERENCES napravl ( napr_id );

ALTER TABLE napravl
    ADD CONSTRAINT napravl_vuz_fk FOREIGN KEY ( vuz_vuz_id )
        REFERENCES vuz ( vuz_id );

