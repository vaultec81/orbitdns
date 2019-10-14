<a href="https://localmesh.org">
<img src="https://img.shields.io/badge/Sponsored%20by-localmesh.org-green">
<img src="https://img.shields.io/badge/matrix-%23orbitdns%3Amatrix.org-blue">
</a>

# OrbitDNS
OrbitDNS is a experiment, distributed, cryptographically signed DNS replacement using IPFS and OrbitDB as record store.
All records are signed and validated across the network.
Networks are individualized, there is no central huge OrbitDNS network, a main network ran by the communiy will be established. Each network will have a staatic root file that contains the DNSKeys for root TLDs. (This may change at some point). Normal DNS TLDs are not allowed to be registed inside yggdns, and will be rejected if proposed.

Supported DNS record types (in progress or completed)
```
SOA
A
AAAA
TXT
NS (Inprogress)
MX (Inprogress)
SRV (Inprogress)
CNAME (Inprogress)
```

How traditional DNS records are treated in OrbitDNS
OrbitDNS will implement DNS records in a different way than traditional.
But to a normal DNS client will look and feel similar or exactly the same as DNS.

SOA contains a DNS signing key for other records and subdomains. All subdomains are assumed to have the same parent DNSKey, unless an SOA is specifically signed to that subdomain.
NS meant to delegate authority to either another OrbitDNS domain or a clearnet server, the resolver that translates OrbitDB records into DNS responses will handle these records. This record type may change in the future (WIP).
CNAME works the same, except resolution of traditional DNS uses upstream server
All other record types should functon the same or similar with light deviations.

### Defintions and concepts:
* Resolver: A DNS server operating on port 53, that resolves OrbitDNS and clearnet records.
* DNS over libp2p: Custom DNS protocol atop libp2p (Planned)
* Root: record that verifies TLD SOA authority.

# Installation

Git installation
```
git clone https://github.com/vaultec81/orbit-dns
cd orbit-dns
npm install
```

npm
```
npm install orbitdns
```

## Usage

```sh
orbitdns init #Create new repo
orbitdns daemon #Start daemon, with API on port 6001
orbitdns help #Help guide
```

# Roadmap
(core)
* Better record verification, arbitary data cannot be added into record.
* Better handling for root record verification. Consensus protocol for adding new TLDs on the fly.
* More record support, NS, MX, SRV, CNAME. Recursive resolution
* Handling for consensus protocol modification. For example adding, DNSKey specific/tiered permission, new TLDs, or other important changes to improve OrbitDNS. <br>

(external/useability)
* Well built CLI client and server interface
* HTTP API. APIs in other languages... OrbitDNS in golang. 
* Support for browser or sandboxed instance

# Technical details.
Each computer operating OrbitDNS will have a OrbitDNS folder containing all the neccessary files. <br>
Default folder is ~/.orbitdns <br>
structure: <br>
```
   /keystore/ - DNSKeys and other cryptographic keys in ipfs-fs-datastore
   /orbitdb/ - OrbitDB database, docstore.
   /ipfs/ - IPFS data, different than default settings to ensure zero conflict with existing jsipfs node.
   /root/ - (Subject to Change) contains a list of root TLDs, must be manually added via CLI or text editor. ~~This may migrate into a KV store with automatic updating. Additional security measures may be added in the future.~~ DatastoreFs KVStore
   /datastore - datastoreFS keyvalue store, contains API specific data and domain authorities.
   /config - JSON configuration file for OrbitDNS. Includes information such as network ID
```



**Deligated signature records**:
Currently when signatures are made in OrbitDNS, only base58 encoded signature and hex publickey are baked into a signed record. Deligated signatures records will denote who exactly signed the record, instead of what public signed the record. 
For example: .tld signs example.tld SOA, the signature will represented as .tld has signed example.tld record with public key A. Public key A can then be compared to valid public keys for .tld. This makes integration with NS record type, meant to delegation authority to another domain possible. (Currently not implemented)

**Multi-signature**:
In many cryptocurrencies, there is the concept of requiring multiple public keys to sign in order for the transaction or record to be valid. OrbitDNS will take a similar
Multi-signature keys are made up of 2 or more public keys. The publickeys are in a list, there is a requirement factor which tells others how many keys are required inorder for the signature to be valid, each publickey must sign the multi-sig key which confirms that all public keys are in agreement. This record with signatures, publickeys, minimum signature setting is then serialized and hashed into a single SHA256 Multihash. Which this can be referened as a single representation of that particular multi signature ring. (Currently not implemented)

# License
MIT